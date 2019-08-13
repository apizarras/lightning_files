import React, { useState, useEffect, useReducer } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDebounce, useSessionStorage } from '../api/hooks';
import {
  getSearchColumns,
  sortItems,
  createLookupFilterClause
} from '../api/query';
import Header from './Header';
import SearchInput from './SearchInput';
import QueryFilters from './QueryFilters';
import FilterTable from './FilterTable';
import { Card } from '@salesforce/design-system-react';
import './ItemPicker.scss';

const ItemPicker = props => {
  const {
    settings,
    description,
    isMultiSelect,
    staticFilter,
    onSelect
  } = props;
  const { api, eventService } = useAppContext();
  const [query, dispatch] = useReducer(queryReducer, {});
  const [columns, setColumns] = useState([]);
  const [searchParams, setSearchParams] = useState();
  const debouncedSearchParams = useDebounce(searchParams, 150);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recentItems, setRecentItems] = useSessionStorage(
    `recents-${description.name}`,
    []
  );

  useEffect(() => {
    async function init() {
      const searchColumns = await getSearchColumns(api, settings, description);
      const columns = searchColumns.map(field => ({ field, visible: true }));
      const orderBy = searchColumns && {
        field: searchColumns.find(x => x.type !== 'location'),
        direction: 'ASC'
      };
      setColumns(columns);

      const staticFilter = await createLookupFilterClause(
        api,
        settings.recordId,
        settings.fieldName
      );
      dispatch({
        type: 'INITIALIZE',
        payload: {
          description,
          columns: searchColumns,
          orderBy,
          staticFilter
        }
      });
    }
    init();
  }, [api, dispatch, description, settings, staticFilter]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_SEARCH', payload: debouncedSearchParams });
  }, [debouncedSearchParams, dispatch]);

  function confirmSelection(items) {
    setRecentItems([...items, ...recentItems].slice(0, 10));

    if (onSelect) {
      onSelect(isMultiSelect ? items : items[0]);
    } else if (console) {
      console.log('onSelect', items);
    }

    eventService.triggerLightningEvent({
      type: 'ITEMS_SELECTED',
      payload: items.map(x => x.Id).join(',')
    });
  }

  function onClear() {
    setSelectedItems([]);

    eventService.triggerLightningEvent({
      type: 'ITEMS_SELECTED',
      payload: null
    });
  }

  function onSelectItem(item) {
    const selected = selectedItems.filter(x => x.Id !== item.Id).concat(item);
    setSelectedItems(sortItems(query, selected));
    if (!isMultiSelect) confirmSelection(selected);
  }

  function onRemoveItem(item) {
    setSelectedItems(selectedItems.filter(x => x.Id !== item.Id));
  }

  return (
    <Card
      className="item-picker"
      hasNoHeader={true}
      bodyClassName="item-picker-contents"
    >
      <Header
        query={query}
        columns={columns}
        description={description}
        selectedItems={selectedItems}
        onConfirm={() => confirmSelection(selectedItems)}
        onClear={onClear}
        onColumnsChange={setColumns}
      />
      <SearchInput
        query={query}
        description={description}
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
        compact={settings.compact}
        query={query}
        columns={columns}
        searchParams={searchParams}
        recentItems={recentItems}
        selectedItems={selectedItems}
        onSelectItem={onSelectItem}
        onRemoveItem={onRemoveItem}
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
      if (payload && payload.searchText.length === 1) return state;
      return { ...state, searchParams: payload };
    case 'INITIALIZE':
      return { ...state, ...getInitialQuery(payload) };
    default:
      return state;
  }
}

function getInitialQuery({ description, columns, orderBy, staticFilter }) {
  return {
    description,
    columns,
    orderBy,
    staticFilter,
    filters: []
  };
}

export default ItemPicker;
