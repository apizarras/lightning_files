import React from 'react';
import FormattedValue from './FormattedValue';
import { Pill, Icon } from '@salesforce/design-system-react';
import './QueryFilters.scss';

const QueryFilters = props => {
  const { query, onRemoveFilter } = props;
  const { filters } = query;

  if (!filters || !filters.length) return null;

  return (
    <div className="slds-page-header slds-page-header_joined">
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
    <Pill
      className="query-filter"
      icon={<Icon category="utility" name="filterList" size="xx-small" />}
      labels={{
        label: <FormattedValue field={field} item={item} />,
        title: field.label,
        removeTitle: 'Remove Filter'
      }}
      onClick={() => onRemove(filter)}
      onRemove={() => onRemove(filter)}
    />
  );
};

export default QueryFilters;
