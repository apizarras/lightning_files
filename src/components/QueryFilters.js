import React from 'react';
import FormattedValue from './FormattedValue';
import { Pill } from '@salesforce/design-system-react';
import { motion, AnimatePresence } from 'framer-motion';
import './QueryFilters.scss';

const QueryFilters = props => {
  const { query, onRemoveFilter } = props;
  const { filters } = query;

  if (!filters || !filters.length) return null;

  return (
    <div className="item-picker-filters slds-page-header slds-page-header_joined">
      <div className="query-filters">
        <AnimatePresence>
          {filters.map((filter, i) => (
            <FilterPill key={i} filter={filter} onRemove={onRemoveFilter} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FilterPill = ({ filter, onRemove }) => {
  const { field, item } = filter;

  return (
    <motion.span
      className="query-filter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Pill
        labels={{
          label: (
            <FormattedValue
              className="filter-value"
              field={field}
              item={item}
            />
          ),
          title: field.label,
          removeTitle: 'Remove Filter'
        }}
        onClick={() => onRemove(filter)}
        onRemove={() => onRemove(filter)}
      />
    </motion.span>
  );
};

export default QueryFilters;
