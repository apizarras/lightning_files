import React, { useState, useEffect, useReducer } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDebounce } from '../api/hooks';
import { getInitialQuery, queryReducer, getColumns } from '../api/soql';
import Header from './Header';
import SearchInput from './SearchInput';
import QueryFilters from './QueryFilters';
import FilterTable from './FilterTable';
import { Card } from '@salesforce/design-system-react';
import './ItemPicker.scss';

const ItemPicker = props => {
  const { description } = props;
  const { api, settings, eventService } = useAppContext();
  const [searchText, setSearchText] = useState(undefined);
  const debouncedSearchText = useDebounce(searchText, 500);
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
    dispatch({ type: 'UPDATE_SEARCH', payload: debouncedSearchText });
  }, [debouncedSearchText, dispatch]);

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
        value={searchText}
        onChange={value => setSearchText(value)}
      />
      <QueryFilters
        query={query}
        onRemoveFilter={filter =>
          dispatch({ type: 'REMOVE_FILTER', payload: filter })
        }
      />
      <FilterTable
        query={query}
        searchText={searchText}
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

export default ItemPicker;
