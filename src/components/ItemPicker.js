import React, { useState, useEffect, useReducer } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDebounce, useLogger } from '../api/hooks';
import { getInitialQuery, queryReducer, getColumns } from '../api/soql';
import QueryFilters from './QueryFilters';
import FilterTable from './FilterTable';
import { Icon, Card, CardFilter } from '@salesforce/design-system-react';
import './ItemPicker.scss';

const ItemPicker = () => {
  const { api, settings } = useAppContext();
  const [title, setTitle] = useState();
  const [textSearch, setTextSearch] = useState(undefined);
  const debouncedTextSearch = useDebounce(textSearch, 500);
  const [query, dispatch] = useLogger(
    useReducer(queryReducer, getInitialQuery(settings))
  );
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    dispatch({ type: 'RESET', payload: settings });
  }, [dispatch, settings]);

  useEffect(() => {
    async function fetchColumns() {
      if (!settings.sobject) return;
      const description = await api.describe(settings.sobject);
      const columns = getColumns(description, settings);
      if (!description || !columns) return;
      setTitle(description.label + ' Picker');
      dispatch({ type: 'UPDATE_COLUMNS', payload: columns });
      dispatch({
        type: 'UPDATE_SORT',
        payload: columns.find(x => x.type !== 'location')
      });
    }

    fetchColumns();
  }, [api, settings, dispatch]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_SEARCH', payload: debouncedTextSearch });
  }, [debouncedTextSearch, dispatch]);

  return (
    <Card
      className="item-picker"
      heading={title}
      icon={<Icon category="standard" name="multi_select_checkbox" />}
      filter={<CardFilter onChange={(e, { value }) => setTextSearch(value)} />}
    >
      <QueryFilters
        query={query}
        onRemoveFilter={filter =>
          dispatch({ type: 'REMOVE_FILTER', payload: filter })
        }
      />
      <FilterTable
        query={query}
        textSearch={textSearch}
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
