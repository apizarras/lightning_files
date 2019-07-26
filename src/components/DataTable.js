import React from 'react';
import { StickyTable, Row, Cell } from 'react-sticky-table';
import { Checkbox, Spinner } from '@salesforce/design-system-react';
import FormattedValue from './FormattedValue';
import './DataTable.scss';

const DataTable = props => {
  const {
    loading,
    query,
    items = [],
    selectedItems = [],
    onAddFilter,
    onUpdateSort,
    onSelectItem,
    onRemoveItem
  } = props;

  if (!query.columns) return null;

  const selectedIds = selectedItems.reduce((ids, x) => {
    ids[x.Id] = true;
    return ids;
  }, {});

  return (
    <div
      className={`data-table ${loading && items.length > 0 ? 'transient' : ''}`}
    >
      {loading && items.length === 0 && <Spinner size="small" variant="base" />}
      <StickyTable stickyColumnCount={1}>
        <Row>
          <Cell className="checkbox-cell"></Cell>
          {query.columns.map(field => (
            <Cell
              key={field.name}
              data-sort={
                onUpdateSort &&
                query.orderBy &&
                query.orderBy.field === field &&
                query.orderBy.direction
              }
              data-type={field.type}
              data-autonumber={field.autoNumber}
              data-field={field.name}
              onClick={() => onUpdateSort && onUpdateSort(field)}
            >
              {field.label}
            </Cell>
          ))}
        </Row>
        {items.map(item => (
          <Row key={item.Id}>
            <Cell className="checkbox-cell">
              <Checkbox
                checked={selectedIds[item.Id]}
                onChange={() =>
                  selectedIds[item.Id] ? onRemoveItem(item) : onSelectItem(item)
                }
              />
            </Cell>
            {query.columns.map(field => (
              <Cell
                key={field.name}
                className={onAddFilter ? 'filter-cell' : null}
                data-type={field.type}
                data-autonumber={field.autoNumber}
                onClick={() => onAddFilter && onAddFilter({ field, item })}
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

export default DataTable;
