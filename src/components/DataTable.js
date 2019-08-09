import React from 'react';
import { StickyTable, Row, Cell } from 'react-sticky-table';
import { Checkbox, Spinner } from '@salesforce/design-system-react';
import FormattedValue from './FormattedValue';
import './DataTable.scss';

const DataTable = props => {
  const {
    className,
    style,
    compact,
    loading,
    displayedColumns,
    orderBy,
    items = [],
    selectedItems = [],
    onAddFilter,
    onUpdateSort,
    onSelectItem,
    onRemoveItem
  } = props;

  if (!displayedColumns) return null;

  const columns = displayedColumns.filter(x => x.visible).map(x => x.field);
  const selectedIds = selectedItems.reduce((ids, x) => {
    ids[x.Id] = true;
    return ids;
  }, {});

  return (
    <div
      className={`data-table ${compact ? 'compact' : null} ${
        loading && items.length > 0 ? 'transient' : ''
      } ${className || ''}`}
      style={style}
    >
      {loading && items.length === 0 && <Spinner size="small" variant="base" />}
      <StickyTable stickyColumnCount={1}>
        <Row>
          <Cell className="checkbox-cell"></Cell>
          {columns.map(field => (
            <Cell
              key={field.name}
              data-sort={
                onUpdateSort &&
                orderBy &&
                orderBy.field === field &&
                orderBy.direction
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
            <Cell
              className="checkbox-cell"
              onClick={e => {
                e.preventDefault();
                selectedIds[item.Id] ? onRemoveItem(item) : onSelectItem(item);
              }}
            >
              <Checkbox checked={selectedIds[item.Id]} readOnly={true} />
            </Cell>
            {columns.map(field => (
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
