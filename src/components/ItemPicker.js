import React, { useState, useEffect, useReducer } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { SYSTEM_FIELDS } from '../constants';
import { useDebounce } from '../api/hooks';
import { getInitialQuery, queryReducer } from '../api/soql';
import QueryFilters from './QueryFilters';
import FilterTable from './FilterTable';
import { Icon, Card, CardFilter } from '@salesforce/design-system-react';
import './ItemPicker.scss';

const ItemPicker = () => {
  const { api, settings } = useAppContext();
  const [title, setTitle] = useState();
  const [textSearch, setTextSearch] = useState(undefined);
  const debouncedTextSearch = useDebounce(textSearch, 500);
  const [query, dispatch] = useReducer(queryReducer, getInitialQuery(settings));

  useEffect(() => {
    async function fetchColumns() {
      const description = await api.describe(settings.sobject);
      const columns = getColumns(description, settings);
      setTitle(description.label + ' Picker');
      dispatch({ type: 'UPDATE_COLUMNS', payload: columns });
    }

    fetchColumns();
  }, [api, settings, dispatch]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_SEARCH_TEXT', payload: debouncedTextSearch });
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

function getColumns(description, settings) {
  const fields = (settings.displayedColumns || [])
    .map(name => description.fields.find(field => field.name === name))
    .filter(field => field);

  if (fields.length === 0) fields.push(...description.fields);

  return fields
    .filter(
      field =>
        settings.hideSystemFields &&
        !~SYSTEM_FIELDS.indexOf(field.name) &&
        !~(settings.hiddenColumns || []).indexOf(field.name) &&
        !/^(FX5__)?Locked_/.test(field.name)
    )
    .slice(0, 20); // max 20 columns
}

export default ItemPicker;
