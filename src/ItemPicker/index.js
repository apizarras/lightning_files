import React, { useState, useEffect, useReducer } from 'react';
import { useComponentContext } from './context';
import { useDebounce, useSessionStorage } from './api/hooks';
import { getSearchFields, sortItems } from './api/query';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import QueryFilters from './components/QueryFilters';
import FilterTable from './components/FilterTable';
import { Card } from '@salesforce/design-system-react';
import './index.scss';

function getInitialQuery({ description, columns, orderBy, staticFilter }) {
  return {
    description,
    columns,
    orderBy,
    staticFilter,
    filters: [],
    implicitSort: 'Id'
  };
}

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
      if (!payload.item[payload.field.name]) return state;
      if (
        state.filters.find(
          ({ field, item }) =>
            field.name === payload.field.name && item[field.name] === payload.item[field.name]
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

const ItemPicker = props => {
  const { compact, multiSelect, showRecentItems, description, staticFilter, onSelect } = props;
  const { api, eventService } = useComponentContext();
  const [query, dispatch] = useReducer(queryReducer, {});
  const [columns, setColumns] = useState([]);
  const [searchParams, setSearchParams] = useState();
  const debouncedSearchParams = useDebounce(searchParams, 150);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recentItems, setRecentItems] = useSessionStorage(`recents-${description.name}`, []);

  useEffect(() => {
    async function init() {
      const searchFields = await getSearchFields(api, description);
      const gridColumns = searchFields.map(field => ({
        field,
        visible: true
      }));
      const orderBy = searchFields && {
        field: searchFields.find(x => x.type !== 'location'),
        direction: 'ASC'
      };
      setColumns(gridColumns);

      dispatch({
        type: 'INITIALIZE',
        payload: {
          description,
          columns: searchFields,
          orderBy,
          staticFilter
        }
      });
    }
    init();
  }, [api, dispatch, description, staticFilter]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_SEARCH', payload: debouncedSearchParams });
  }, [debouncedSearchParams, dispatch]);

  function confirmSelection(items) {
    if (showRecentItems) {
      // TODO: use an 'IN' query instead
      setRecentItems(
        [...items, ...recentItems.filter(x => !items.some(item => item.Id === x.Id))].slice(0, 10)
      );
    }

    if (onSelect) {
      onSelect(multiSelect ? items : items[0]);
    } else if (console) {
      console.log('onSelect', items);
    }

    eventService &&
      eventService.sendMessage({
        name: 'ITEMS_SELECTED',
        value: items.map(x => x.Id)
      });
  }

  function onClear() {
    setSelectedItems([]);

    eventService &&
      eventService.sendMessage({
        name: 'ITEMS_SELECTED',
        value: null
      });
  }

  function onSelectItem(item) {
    const selected = selectedItems.filter(x => x.Id !== item.Id).concat(item);
    setSelectedItems(sortItems(query, selected));
    if (!multiSelect) confirmSelection(selected);
  }

  function onRemoveItem(item) {
    setSelectedItems(selectedItems.filter(x => x.Id !== item.Id));
  }

  return (
    <Card className="item-picker" hasNoHeader={true} bodyClassName="item-picker-contents">
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
        onAddFilter={filter => dispatch({ type: 'ADD_FILTER', payload: filter })}
      />
      <QueryFilters
        query={query}
        onRemoveFilter={filter => dispatch({ type: 'REMOVE_FILTER', payload: filter })}
      />
      <FilterTable
        compact={compact}
        multiSelect={multiSelect}
        showRecentItems={showRecentItems}
        query={query}
        columns={columns}
        searchParams={searchParams}
        recentItems={recentItems}
        selectedItems={selectedItems}
        onSelectItem={onSelectItem}
        onRemoveItem={onRemoveItem}
        onAddFilter={filter => dispatch({ type: 'ADD_FILTER', payload: filter })}
        onUpdateSort={field => dispatch({ type: 'UPDATE_SORT', payload: field })}
      />
    </Card>
  );
};

export default ItemPicker;
