import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { getSettingsFields } from '../api/soql';
import { Input, InputIcon } from '@salesforce/design-system-react';

const SearchInput = props => {
  const { query, description, value, onChange } = props;
  const { settings } = useAppContext();
  if (!description || !query || !query.columns) return null;
  const placeholder = getSearchFieldLabels(settings, description, query);

  return (
    <div className="slds-page-header slds-page-header_joined">
      <Input
        iconLeft={
          <InputIcon
            assistiveText={{
              icon: 'Search'
            }}
            category="utility"
            name="search"
          />
        }
        iconRight={
          value && (
            <InputIcon
              assistiveText={{
                icon: 'Clear'
              }}
              category="utility"
              name="clear"
              onClick={() => onChange('')}
            />
          )
        }
        placeholder={`Search ${placeholder || ''}`}
        value={value}
        onChange={(e, { value }) => onChange(value)}
      />
    </div>
  );
};

function getSearchFieldLabels(settings, description, query) {
  if (!settings) return;
  const searchFields = getSettingsFields(
    description.fields,
    settings.searchFields
  );
  if (!searchFields) return;

  return searchFields
    .filter(({ name }) => query.columns.find(field => field.name === name))
    .map(x => x.label)
    .join(', ');
}

export default SearchInput;
