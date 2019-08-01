import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Combobox } from '@salesforce/design-system-react';
import comboboxFilterAndLimit from '@salesforce/design-system-react/components/combobox/filter';

const PicklistCombobox = props => {
  const { description, field, onSelect } = props;
  const { api } = useAppContext();
  const [inputValue, setInputValue] = useState();
  const [options, setOptions] = useState();

  useEffect(() => {
    if (!field || options) return;

    api
      .describePicklist(description.name, field.name)
      .then(values =>
        setOptions(values.map(({ value }) => ({ id: value, label: value })))
      );
  }, [api, description, field, options]);

  if (!description || !field) return null;

  const availableOptions = comboboxFilterAndLimit({
    inputValue,
    limit: 10,
    options: options || [],
    selection: []
  });

  return (
    <Combobox
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
