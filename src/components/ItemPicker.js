import React, { useState, useEffect, useReducer } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { SYSTEM_FIELDS } from '../constants';
import QueryFilters from './QueryFilters';
import FilterTable from './FilterTable';
import { Icon, Card, CardFilter } from '@salesforce/design-system-react';
import './ItemPicker.scss';

const ItemPicker = () => {
  const { api, settings } = useAppContext();
  const [title, setTitle] = useState();
  const [columns, setColumns] = useState();
  const [filters, dispatch] = useReducer(reducer, []);
  const [textSearch, setTextSearch] = useState();

  useEffect(() => {
    async function fetchColumns() {
      if (!settings) return;

      const description = await api.describe(settings.sobject);
      const fields = (settings.defaultColumns || [])
        .map(name => description.fields.find(field => field.name === name))
        .filter(field => field);

      if (fields.length === 0) fields.push(...description.fields);

      setTitle(description.label + ' Picker');
      setColumns(
        fields
          .filter(
            field =>
              settings.hideSystemFields &&
              !~SYSTEM_FIELDS.indexOf(field.name) &&
              !~(settings.hiddenColumns || []).indexOf(field.name) &&
              !/^(FX5__)?Locked_/.test(field.name)
          )
          .slice(0, 20) // max 20 columns
      );
    }

    fetchColumns();
  }, [api, settings]);

  function onAddFilter(field, item) {
    const value = item[field.name];
    if (!value) return;

    dispatch({
      type: 'ADD_FILTER',
      payload: { field, item }
    });
  }

  function onRemoveFilter(filter) {
    dispatch({ type: 'REMOVE_FILTER', payload: filter });
  }

  function onSearch(e, { value }) {
    setTextSearch(value);
  }

  return (
    <Card
      className="item-picker"
      heading={title}
      icon={<Icon category="standard" name="multi_select_checkbox" />}
      filter={<CardFilter onChange={onSearch} />}
    >
      <QueryFilters
        sobject={settings.sobject}
        filters={filters}
        onAddFilter={onAddFilter}
        onRemoveFilter={onRemoveFilter}
      />
      <FilterTable
        sobject={settings.sobject}
        columns={columns}
        staticFilters={settings.staticFilters}
        filters={filters}
        textSearch={textSearch}
        onAddFilter={onAddFilter}
      />
    </Card>
  );
};

function reducer(state, action) {
  const { type, payload } = action;

  switch (type) {
    case 'ADD_FILTER':
      return state.concat(payload);
    case 'REMOVE_FILTER':
      return state.filter(x => x !== payload);
    default:
      return state;
  }
}

export default ItemPicker;
