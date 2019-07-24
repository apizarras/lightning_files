import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { StickyTable, Row, Cell } from 'react-sticky-table';
import { Checkbox, Spinner } from '@salesforce/design-system-react';
import FormattedValue from './FormattedValue';
import { executeQuery, executeLocalSearch } from '../api/soql';
import 'react-sticky-table/dist/react-sticky-table.css';
import './FilterTable.scss';

const FilterTable = props => {
  const { query, textSearch, onAddFilter, onUpdateSort } = props;
  const { api } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!query.columns) return;

    async function fetchRows() {
      setLoading(true);
      const items = await executeQuery(api, query);
      setItems(items);
      setLoading(false);
    }

    fetchRows();
  }, [api, query]);

  useEffect(() => {
    if (query.searchText === textSearch) return;
    const filteredItems = executeLocalSearch(query, items, textSearch);
    if (filteredItems === items) return;
    setItems(filteredItems);
    setLoading(true);
  }, [query, items, textSearch]);

  if (!query.columns) return null;

  return (
    <div
      className={`filter-table ${
        loading && items.length > 0 ? 'transient' : ''
      }`}
    >
      {loading && items.length === 0 && <Spinner size="small" variant="base" />}
      <StickyTable stickyColumnCount={1}>
        <Row>
          <Cell></Cell>
          {query.columns.map(field => (
            <Cell
              key={field.name}
              data-sort={
                query.orderBy &&
                query.orderBy.field === field &&
                query.orderBy.direction
              }
              data-type={field.type}
              data-autonumber={field.autoNumber}
              data-field={field.name}
              onClick={() => onUpdateSort(field)}
            >
              {field.label}
            </Cell>
          ))}
        </Row>
        {items.map(item => (
          <Row key={item.Id}>
            <Cell>
              <Checkbox />
            </Cell>
            {query.columns.map(field => (
              <Cell
                key={field.name}
                className="filter-item"
                data-type={field.type}
                data-autonumber={field.autoNumber}
                onClick={() => onAddFilter({ field, item })}
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

export default FilterTable;
