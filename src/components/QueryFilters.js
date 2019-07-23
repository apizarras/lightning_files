import React from 'react';
import FormattedValue from './FormattedValue';
import { Pill, Icon } from '@salesforce/design-system-react';
import './QueryFilters.scss';

const QueryFilters = props => {
  const { filters, onRemoveFilter } = props;

  if (!filters || !filters.length)
    return (
      <div className="slds-card__body slds-card__body--inner">
        <p>
          Results can be filtered by selecting cells that match desired values
        </p>
      </div>
    );

  return (
    <div className="slds-card__body slds-card__body--inner">
      {filters.map((filter, i) => (
        <FilterPill key={i} filter={filter} onRemove={onRemoveFilter} />
      ))}
    </div>
  );
};

const FilterPill = ({ filter, onRemove }) => {
  const { field, item } = filter;

  return (
    <Pill
      className="query-filter"
      labels={{
        label: <FormattedValue field={field} item={item} />,
        title: field.label,
        removeTitle: 'Remove Filter'
      }}
      icon={<Icon category="utility" name="filterList" size="xx-small" />}
      onClick={() => onRemove(filter)}
      onRemove={() => onRemove(filter)}
    />
  );
};

export default QueryFilters;
