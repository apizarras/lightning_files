import React from 'react';
import FormattedValue from './FormattedValue';
import { Pill, Icon } from '@salesforce/design-system-react';
import './QueryFilters.scss';

const QueryFilters = props => {
  const { query, onRemoveFilter } = props;
  const { filters } = query;

  if (!filters || !filters.length) return null;
  // return (
  //   <div className="slds-card__body slds-card__body--inner">
  //     <p style={{ margin: '1.2rem 0' }}>
  //       Quickly filter matches by selecting cells with desired values
  //     </p>
  //   </div>
  // );

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
