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
    columns,
    orderBy,
    items = [],
    selectedItems = [],
    onAddFilter,
    onUpdateSort,
    onSelectItem,
    onRemoveItem
  } = props;

  if (!columns) return null;

  const visibleColumns = columns.filter(x => x.visible).map(x => x.field);
  const selectedIds = selectedItems.reduce((ids, x) => {
    ids[x.Id] = true;
    return ids;
  }, {});

  if (!loading && items.length === 0) return null;

  return (
    <div
      className={`data-table ${compact ? 'compact' : null} ${
        loading && items.length > 0 ? 'transient' : ''
      } ${className || ''}`}
      style={style}>
      {loading && items.length === 0 && <Spinner size="small" variant="base" />}
      <StickyTable stickyColumnCount={onSelectItem ? 1 : 0}>
        <Row>
          {onSelectItem && <Cell className="checkbox-cell"></Cell>}
          {visibleColumns.map(field => (
            <Cell
              key={field.name}
              data-sort={onUpdateSort && orderBy && orderBy.field === field && orderBy.direction}
              data-cell-type={field.type}
              data-autonumber={field.autoNumber}
              data-field={field.name}
              onClick={() => onUpdateSort && onUpdateSort(field)}>
              {field.label}
            </Cell>
          ))}
        </Row>

        {items.map(item => (
          <Row key={item.Id}>
            {onSelectItem && (
              <Cell className="checkbox-cell">
                <Checkbox
                  checked={Boolean(selectedIds[item.Id])}
                  onChange={e => {
                    selectedIds[item.Id] ? onRemoveItem(item) : onSelectItem(item);
                  }}
                />
              </Cell>
            )}
            {visibleColumns.map(field => (
              <Cell
                key={field.name}
                className={onAddFilter ? 'filter-cell' : null}
                data-cell-type={field.type}
                data-autonumber={field.autoNumber}
                onClick={() => onAddFilter && onAddFilter({ field, item })}>
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
