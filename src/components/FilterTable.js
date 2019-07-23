import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { StickyTable, Row, Cell } from 'react-sticky-table';
import { Checkbox, Spinner } from '@salesforce/design-system-react';
import FormattedValue from './FormattedValue';
import { getFieldNames, getWhereClause, getOrderBy } from '../api/soql';
import 'react-sticky-table/dist/react-sticky-table.css';
import './FilterTable.scss';

const FilterTable = props => {
  const { sobject, columns, filters, staticFilters, onAddFilter } = props;
  const { api } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!columns || !columns.length) {
      setOrderBy(null);
      return;
    }
    setOrderBy({ field: columns[0], direction: 'ASC' });
  }, [columns]);

  useEffect(() => {
    async function fetchRows() {
      if (!sobject || !columns || !orderBy) return;

      const fieldNames = getFieldNames(columns);
      const soql = [`SELECT ${fieldNames.join(',')} FROM ${sobject}`];
      soql.push(getWhereClause(filters, staticFilters));
      soql.push(getOrderBy(orderBy));
      soql.push('LIMIT 50');

      setLoading(true);
      const items = await api.query(soql.join(' '));
      setItems(items);
      setLoading(false);
    }

    fetchRows();
  }, [api, sobject, columns, filters, orderBy]);

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

  if (!columns || !items) return null;

  return (
    <div className="filter-table">
      {loading && <Spinner size="small" variant="base" />}
      <StickyTable stickyColumnCount={1}>
        <Row>
          <Cell>
            <Checkbox />
          </Cell>
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
        {items.map(item => (
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

export default FilterTable;
