import React from 'react';
import FormattedValue from './FormattedValue';
import { Pill } from '@salesforce/design-system-react';
import './QueryFilters.scss';

const QueryFilters = props => {
  const { query, onRemoveFilter } = props;
  const { filters } = query;

  if (!filters || !filters.length) return null;

  return (
    <div className="item-picker-filters slds-page-header slds-page-header_joined">
      <div className="query-filters">
        {filters.map((filter, i) => (
          <FilterPill key={i} filter={filter} onRemove={onRemoveFilter} />
        ))}
      </div>
    </div>
  );
};

const FilterPill = ({ filter, onRemove }) => {
  const { field, item } = filter;

  return (
    <span className="query-filter">
      <Pill
        labels={{
          label: <FormattedValue className="filter-value" field={field} item={item} />,
          title: field.label,
          removeTitle: 'Remove Filter'
        }}
        onClick={() => onRemove(filter)}
        onRemove={() => onRemove(filter)}
      />
    </span>
  );
};

export default QueryFilters;
