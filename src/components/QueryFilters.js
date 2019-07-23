import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import FormattedValue from './FormattedValue';
import { Pill, Icon } from '@salesforce/design-system-react';
import './QueryFilters.scss';

const QueryFilters = props => {
  const { sobject, filters, onRemoveFilter } = props;
  const { api } = useAppContext();
  const [fields, setFields] = useState();

  useEffect(() => {
    if (!sobject) return;

    async function fetchData() {
      const description = await api.describe(sobject);
      setFields(description.fields);
    }

    fetchData();
  }, [api, sobject]);

  if (!filters || !filters.length)
    return (
      <div className="slds-card__body slds-card__body--inner">
        <p>Select cells to match similar items</p>
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
