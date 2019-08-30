import React, { useState, useEffect } from 'react';
import { useComponentContext } from '../context';
import { Combobox } from '@salesforce/design-system-react';
import comboboxFilterAndLimit from '@salesforce/design-system-react/components/combobox/filter';

const PicklistCombobox = props => {
  const { className, query, field, onSelect } = props;
  const { api } = useComponentContext();
  const [inputValue, setInputValue] = useState();
  const [options, setOptions] = useState();

  useEffect(() => {
    if (!query || !field) return;

    api
      .describePicklist(query.description.name, field.name)
      .then(values => setOptions(values.map(({ value }) => ({ id: value, label: value }))));
  }, [api, query, field]);

  if (!query || !field) return null;

  const availableOptions = comboboxFilterAndLimit({
    inputValue,
    limit: 10,
    options: options || [],
    selection: query.filters
      .filter(filter => filter.field.name === field.name)
      .map(({ field, item }) => ({ id: item[field.name] }))
  });

  return (
    <Combobox
      className={className}
      events={{
        onChange: (event, { value }) => {
          setInputValue(value);
        },
        onSelect: (event, data) => {
          if (onSelect) {
            const { id } = data.selection[0];
            onSelect(event, { [field.name]: id });
          } else if (console) {
            console.log('onSelect', event, data);
          }
          setInputValue('');
        }
      }}
      options={availableOptions}
      predefinedOptionsOnly={true}
      selection={[]}
      value={inputValue}
    />
  );
};

export default PicklistCombobox;
