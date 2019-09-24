import React, { useState, useEffect, useReducer } from 'react';
import { useComponentContext } from './context';
import { useDebounce, useSessionStorage } from './api/hooks';
import { getSearchFields } from './api/query';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import QueryFilters from './components/QueryFilters';
import FilterTable from './components/FilterTable';
import { Card, Spinner, ToastContainer, Toast } from '@salesforce/design-system-react';
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
  const {
    title = 'Item Picker',
    actionButtonLabel = 'Confirm Selection',
    compact,
    multiSelect,
    showRecentItems,
    description,
    staticFilter,
    onSelect
  } = props;
  const { api, eventService } = useComponentContext();
  const [query, dispatch] = useReducer(queryReducer, {});
  const [columns, setColumns] = useState([]);
  const [searchParams, setSearchParams] = useState();
  const debouncedSearchParams = useDebounce(searchParams, 150);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recentItems, setRecentItems] = useSessionStorage(`recents-${description.name}`, []);
  const [actionPending, setActionPending] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState();
  const [errorMessage, setErrorMessage] = useState();

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
    if (!onSelect) return onClear();

    if (showRecentItems) {
      // TODO: use an 'IN' query instead
      setRecentItems(
        [...items, ...recentItems.filter(x => !items.some(item => item.Id === x.Id))].slice(0, 10)
      );
    }

    setActionPending(true);

    Promise.resolve(onSelect(multiSelect ? items : items[0]))
      .then(() => {
        onClear();
        eventService && eventService.refreshView && eventService.refreshView();
        setConfirmationMessage(
          `Successfully created ${items.length} item${items.length === 1 ? '' : 's'}`
        );
      })
      .catch(error => {
        setErrorMessage(error && error.message);
      })
      .finally(() => setActionPending(false));
  }

  function onClear() {
    setSelectedItems([]);
  }

  function onSelectItem(item) {
    const selected = selectedItems.filter(x => x.Id !== item.Id).concat(item);
    setSelectedItems(selected);
    if (!multiSelect) confirmSelection(selected);
  }

  function onRemoveItem(item) {
    setSelectedItems(selectedItems.filter(x => x.Id !== item.Id));
  }

  return (
    <Card className="item-picker" hasNoHeader={true} bodyClassName="item-picker-contents">
      <ToastContainer>
        {confirmationMessage && (
          <Toast
            labels={{
              heading: confirmationMessage
            }}
            variant="success"
            onRequestClose={() => setConfirmationMessage(null)}
          />
        )}
        {errorMessage && (
          <Toast
            variant="error"
            labels={{
              heading: 'Items could not be created',
              details: errorMessage
            }}
            onRequestClose={() => setErrorMessage(null)}
          />
        )}
      </ToastContainer>
      <Header
        title={title}
        actionButtonLabel={actionButtonLabel}
        query={query}
        description={description}
        selectedItems={selectedItems}
        onConfirm={() => confirmSelection(selectedItems)}
        onClear={onClear}
      />
      <SearchInput
        query={query}
        columns={columns}
        description={description}
        onChange={value => setSearchParams(value)}
        onColumnsChange={setColumns}
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
        onSelectItem={onSelect && onSelectItem}
        onRemoveItem={onRemoveItem}
        onAddFilter={filter => dispatch({ type: 'ADD_FILTER', payload: filter })}
        onUpdateSort={field => dispatch({ type: 'UPDATE_SORT', payload: field })}
      />
      {actionPending && <Spinner size="medium" variant="base" />}
    </Card>
  );
};

export default ItemPicker;
