import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { StickyTable, Row, Cell } from 'react-sticky-table';
import { Checkbox, Spinner } from '@salesforce/design-system-react';
import FormattedValue from './FormattedValue';
import { query } from '../api/soql';
import { useDebounce } from '../api/hooks';
import 'react-sticky-table/dist/react-sticky-table.css';
import './FilterTable.scss';

const FilterTable = props => {
  const {
    sobject,
    columns,
    staticFilters,
    filters,
    textSearch,
    onAddFilter
  } = props;
  const { api } = useAppContext();
  const [fetching, setFetching] = useState(false);
  const [orderBy, setOrderBy] = useState();
  const [items, setItems] = useState([]);
  const [debouncedTextSearch, debouncing] = useDebounce(textSearch, 500);
  const loading = fetching || debouncing;

  useEffect(() => {
    if (!columns || !columns.length) return setOrderBy(null);
    setOrderBy({ field: columns[0], direction: 'ASC' });
  }, [columns]);

  useEffect(() => {
    if (!sobject || !columns || !orderBy) return;

    async function fetchRows() {
      setFetching(true);

      const items = await query(
        api,
        sobject,
        columns,
        orderBy,
        staticFilters,
        filters,
        debouncedTextSearch
      );
      setItems(items);
      setFetching(false);
    }

    fetchRows();
  }, [
    api,
    sobject,
    columns,
    orderBy,
    staticFilters,
    filters,
    debouncedTextSearch
  ]);

  function updateSort(field) {
    if (orderBy && orderBy.field === field) {
      setOrderBy({
        field,
        direction: orderBy.direction === 'ASC' ? 'DESC' : 'ASC'
      });
      return;
    }
    setOrderBy({ field, direction: 'ASC' });
  }

  if (!columns) return null;

  const filteredItems = loading
    ? localSearch(columns, items, textSearch)
    : items;

  return (
    <div
      className={`filter-table ${
        loading && items.length > 0 ? 'refreshing' : ''
      }`}
    >
      {loading && items.length === 0 && <Spinner size="small" variant="base" />}
      <StickyTable stickyColumnCount={1}>
        <Row>
          <Cell></Cell>
          {columns.map(field => (
            <Cell
              key={field.name}
              data-sort={
                orderBy && orderBy.field === field && orderBy.direction
              }
              data-type={field.type}
              data-autonumber={field.autoNumber}
              data-field={field.name}
              onClick={() => updateSort(field)}
            >
              {field.label}
            </Cell>
          ))}
        </Row>
        {filteredItems.map(item => (
          <Row key={item.Id}>
            <Cell>
              <Checkbox />
            </Cell>
            {columns.map(field => (
              <Cell
                key={field.name}
                className="filter-item"
                data-type={field.type}
                data-autonumber={field.autoNumber}
                onClick={() => onAddFilter(field, item)}
              >
                <FormattedValue field={field} item={item} />
              </Cell>
            ))}
          </Row>
        ))}
      </StickyTable>
    </div>
  );
};

function localSearch(columns, items, textSearch) {
  const keywords = textSearch
    ? textSearch
        .trim()
        .split(' ')
        .map(x => new RegExp(x.trim(), 'i'))
    : [];

  if (keywords.length > 0) {
    items.forEach(item => {
      if (item._keywords) return;

      item._keywords = columns
        .filter(({ type }) => type === 'string' || type === 'reference')
        .map(({ type, name, relationshipName }) =>
          type === 'reference'
            ? item[name] && item[relationshipName].Name
            : item[name]
        )
        .join(' ');
    });
  }

  const filteredItems =
    textSearch && textSearch.length > 2
      ? items
          .filter(item =>
            keywords.reduce(
              (result, search) => search.test(item._keywords) && result,
              true
            )
          )
          .slice(0, 50)
      : items.slice(0, 50);

  return filteredItems;
}

export default FilterTable;
