import React, { useState, useEffect } from 'react';
import PicklistCombobox from './PicklistCombobox';
import ReferenceCombobox from './ReferenceCombobox';
import {
  Dropdown,
  DropdownTrigger,
  Button,
  ButtonGroup,
  Input,
  InputIcon
} from '@salesforce/design-system-react';
import './SearchInput.scss';

const SearchInput = props => {
  const { query, description, value, onChange, onAddFilter } = props;
  const [field, setField] = useState();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (value) {
      if (searchText === '' && value.searchText === searchText) return;
      if (value.field === field && value.searchText === searchText) return;
    }
    onChange({ field, searchText });
  }, [value, field, searchText, onChange]);

  if (!description || !query || !query.columns) return null;

  let inputComponent = (
    <Input
      className="search-text"
      iconRight={
        searchText && (
          <InputIcon
            assistiveText={{
              icon: 'Clear'
            }}
            category="utility"
            name="clear"
            onClick={() => setSearchText('')}
          />
        )
      }
      value={searchText}
      type="search"
      onChange={(e, { value }) => setSearchText(value)}
    />
  );

  if (field && field.type === 'picklist') {
    inputComponent = (
      <PicklistCombobox
        description={description}
        field={field}
        onSelect={(event, item) => {
          onAddFilter({ field, item });
        }}
      />
    );
  }

  if (field && field.type === 'reference') {
    inputComponent = (
      <ReferenceCombobox
        query={query}
        field={field}
        onSelect={(event, item) => {
          onAddFilter({ field, item });
        }}
      />
    );
  }

  return (
    <div className="slds-page-header item-picker-search">
      <ButtonGroup variant="list">
        <Dropdown
          options={getFilterOptions(query)}
          onSelect={option => setField(description.fields[option.value])}
        >
          <DropdownTrigger>
            <Button
              iconCategory="utility"
              iconName={field ? 'filterList' : 'search'}
              iconVariant="more"
              label={` ${field ? field.label : 'Search'}`}
            />
          </DropdownTrigger>
        </Dropdown>
        {inputComponent}
      </ButtonGroup>
    </div>
  );
};

function getFilterOptions(query) {
  return [
    { label: 'Search', leftIcon: { category: 'utility', name: 'search' } },
    ...query.columns
      .filter(
        ({ type }) =>
          type === 'string' || type === 'reference' || type === 'picklist'
      )
      .map(({ label, name }) => ({
        label,
        value: name,
        leftIcon: {
          category: 'utility',
          name: 'filterList'
        }
      }))
  ];
}

export default SearchInput;
