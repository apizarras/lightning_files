import React, { useState, useEffect, useReducer } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDebounce } from '../api/hooks';
import { getColumns } from '../api/query';
import Header from './Header';
import SearchInput from './SearchInput';
import QueryFilters from './QueryFilters';
import FilterTable from './FilterTable';
import { Card } from '@salesforce/design-system-react';
import './ItemPicker.scss';

const ItemPicker = props => {
  const { description } = props;
  const { api, settings, eventService } = useAppContext();
  const [searchParams, setSearchParams] = useState(undefined);
  const debouncedSearchParams = useDebounce(searchParams, 150);
  const [selectedItems, setSelectedItems] = useState([]);
  const [query, dispatch] = useReducer(queryReducer, getInitialQuery(settings));

  useEffect(() => {
    dispatch({ type: 'RESET', payload: settings });
  }, [dispatch, settings]);

  useEffect(() => {
    async function fetchColumns() {
      const columns = getColumns(description, settings);
      if (!columns) return;

      dispatch({ type: 'UPDATE_COLUMNS', payload: columns });
      dispatch({
        type: 'UPDATE_SORT',
        payload: columns.find(x => x.type !== 'location')
      });
    }

    fetchColumns();
  }, [api, settings, description, dispatch]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_SEARCH', payload: debouncedSearchParams });
  }, [debouncedSearchParams, dispatch]);

  return (
    <Card className="item-picker" hasNoHeader={true}>
      <Header
        query={query}
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
    case 'RESET':
      return getInitialQuery(payload);
    default:
      return state;
  }
}

function getInitialQuery(settings) {
  return {
    sobject: settings.sobject,
    columns: undefined,
    orderBy: undefined,
    staticFilters: settings.staticFilters,
    filters: [],
    searchParams: undefined
  };
}

export default ItemPicker;
