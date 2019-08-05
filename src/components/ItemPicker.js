import React, { useState, useEffect, useReducer } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDebounce } from '../api/hooks';
import { getDisplayedColumns } from '../api/query';
import Header from './Header';
import SearchInput from './SearchInput';
import QueryFilters from './QueryFilters';
import FilterTable from './FilterTable';
import { Card } from '@salesforce/design-system-react';
import './ItemPicker.scss';

const ItemPicker = props => {
  const { description } = props;
  const { api, settings, eventService } = useAppContext();
  const [searchParams, setSearchParams] = useState('');
  const debouncedSearchParams = useDebounce(searchParams, 150);
  const [selectedItems, setSelectedItems] = useState([]);
  const [displayedColumns, setDisplayedColumns] = useState([]);
  const [query, dispatch] = useReducer(queryReducer, {});

  useEffect(() => {
    async function init() {
      const layout = await api.searchLayout(description.name);
      const columns = getColumnsFromSearchLayout(description, layout);
      const displayedColumns = getDisplayedColumns(
        description,
        settings,
        columns
      );
      setDisplayedColumns(
        displayedColumns.map(field => ({ field, visible: true }))
      );
      dispatch({
        type: 'INITIALIZE',
        payload: { columns, settings }
      });
    }
    init();
  }, [api, dispatch, description, settings]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_SEARCH', payload: debouncedSearchParams });
  }, [debouncedSearchParams, dispatch]);

  return (
    <Card className="item-picker" hasNoHeader={true}>
      <Header
        query={query}
        displayedColumns={displayedColumns}
        description={description}
        selectedItems={selectedItems}
        onConfirm={() =>
          eventService.triggerLightningEvent({
            type: 'ITEMS_SELECTED',
            payload: selectedItems.map(x => x.Id).join(',')
          })
        }
        onClear={() => {
          setSelectedItems([]);
          eventService.triggerLightningEvent({
            type: 'ITEMS_SELECTED',
            payload: null
          });
        }}
        onColumnsChange={setDisplayedColumns}
      />
      <SearchInput
        query={query}
        description={description}
        value={searchParams}
        onChange={value => setSearchParams(value)}
        onAddFilter={filter =>
          dispatch({ type: 'ADD_FILTER', payload: filter })
        }
      />
      <QueryFilters
        query={query}
        onRemoveFilter={filter =>
          dispatch({ type: 'REMOVE_FILTER', payload: filter })
        }
      />
      <FilterTable
        query={query}
        displayedColumns={displayedColumns}
        searchParams={searchParams}
        selectedItems={selectedItems}
        onSelectItem={item => setSelectedItems(selectedItems.concat(item))}
        onRemoveItem={item =>
          setSelectedItems(selectedItems.filter(x => x !== item))
        }
        onAddFilter={filter =>
          dispatch({ type: 'ADD_FILTER', payload: filter })
        }
        onUpdateSort={field =>
          dispatch({ type: 'UPDATE_SORT', payload: field })
        }
      />
    </Card>
  );
};

function queryReducer(state, action) {
  const { type, payload } = action;

  switch (type) {
    case 'UPDATE_COLUMNS':
      return { ...state, columns: payload };
    case 'UPDATE_SORT':
      const direction = state.orderBy
        ? state.orderBy.field === payload
          ? state.orderBy.direction === 'ASC'
            ? 'DESC'
            : 'ASC'
          : 'ASC'
        : 'ASC';

      return { ...state, orderBy: { field: payload, direction } };
    case 'ADD_FILTER':
      if (
        state.filters.find(
          ({ field, item }) =>
            field.name === payload.field.name &&
            item[field.name] === payload.item[field.name]
        )
      ) {
        return state;
      }
      return { ...state, filters: state.filters.concat(payload) };
    case 'REMOVE_FILTER':
      return { ...state, filters: state.filters.filter(x => x !== payload) };
    case 'UPDATE_SEARCH':
      if (state.searchParams === payload) return state;
      if (payload && payload.searchText.length === 1) return state;
      return { ...state, searchParams: payload };
    case 'INITIALIZE':
      return getInitialQuery(payload);
    default:
      return state;
  }
}

function getInitialQuery({ columns, settings }) {
  return {
    sobject: settings.sobject,
    columns,
    orderBy: columns && {
      field: columns.find(x => x.type !== 'location'),
      direction: 'ASC'
    },
    staticFilters: [],
    filters: [],
    searchParams: undefined
  };
}

function getColumnsFromSearchLayout(description, layout) {
  return layout.searchColumns
    .reduce(
      (names, { name }) => {
        const fieldName = name
          .replace('r.Name', 'c')
          .replace('toLabel(', '')
          .replace(')', '');
        names.push(fieldName);
        return names;
      },
      ['Id', 'CurrencyIsoCode']
    )
    .map(name => description.fields[name])
    .filter(field => field);
}

export default ItemPicker;
