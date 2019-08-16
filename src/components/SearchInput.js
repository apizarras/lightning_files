import React, { useState, useLayoutEffect, useRef } from 'react';
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
  const { query, description, onChange, onAddFilter } = props;
  const [field, setField] = useState();
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef();

  useLayoutEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
  }, [field, inputRef]);

  function onSearchChange(searchText) {
    setSearchText(searchText);
    onChange({ field, searchText });
  }

  let inputComponent = (
    <Input
      inputRef={inputRef}
      className="search-input"
      iconRight={
        searchText && (
          <InputIcon
            assistiveText={{
              icon: 'Clear'
            }}
            category="utility"
            name="clear"
            onClick={() => onSearchChange('')}
          />
        )
      }
      type="search"
      value={searchText}
      onChange={(e, { value }) => {
        onSearchChange(value);
      }}
      onKeyPress={event => {
        if (field && event.key === 'Enter') {
          onAddFilter({ field, item: { [field.name]: searchText } });
        }
      }}
    />
  );

  if (field && field.type === 'picklist') {
    inputComponent = (
      <PicklistCombobox
        className="search-input"
        query={query}
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
        className="search-input"
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
      <ButtonGroup variant="list" className="search-bar">
        <Dropdown
          options={getFilterOptions(query)}
          onSelect={option => {
            onSearchChange('');
            setField(description.fields[option.value]);
          }}
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
  const options = [
    { label: 'Search', leftIcon: { category: 'utility', name: 'search' } }
  ];

  if (query.columns) {
    options.push(
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
    );
  }

  return options;
}

export default SearchInput;
