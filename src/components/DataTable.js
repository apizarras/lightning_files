import React from 'react';
import { StickyTable, Row, Cell } from 'react-sticky-table';
import { Checkbox, Spinner } from '@salesforce/design-system-react';
import FormattedValue from './FormattedValue';
import { motion, AnimatePresence } from 'framer-motion';
import './DataTable.scss';

const DataTable = props => {
  const {
    className,
    style,
    compact,
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
      className={`data-table ${compact ? 'compact' : null} ${
        loading && items.length > 0 ? 'transient' : ''
      } ${className || ''}`}
      style={style}
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

        <AnimatePresence>
          {items.map(item => (
            <Row key={item.Id}>
              <Cell
                className="checkbox-cell"
                onClick={() =>
                  selectedIds[item.Id] ? onRemoveItem(item) : onSelectItem(item)
                }
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Checkbox checked={selectedIds[item.Id]} />
                </motion.div>
              </Cell>
              {query.columns.map(field => (
                <Cell
                  key={field.name}
                  className={onAddFilter ? 'filter-cell' : null}
                  data-type={field.type}
                  data-autonumber={field.autoNumber}
                  onClick={() => onAddFilter && onAddFilter({ field, item })}
                >
                  {item[field.name] && (
                    <FormattedValue field={field} item={item} />
                  )}
                </Cell>
              ))}
            </Row>
          ))}
        </AnimatePresence>
      </StickyTable>
    </div>
  );
};

export default DataTable;
