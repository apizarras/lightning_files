import React, { useState, useEffect, useReducer } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Combobox } from '@salesforce/design-system-react';
import comboboxFilterAndLimit from '@salesforce/design-system-react/components/combobox/filter';

const PicklistCombobox = props => {
  const { description, field, onSelect } = props;
  const { api } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState();
  const [picklistValues, dispatch] = useReducer(updatePicklistValues, {});

  useEffect(() => {
    if (!field || picklistValues[field.name]) return;

    api.describePicklist(description.name, field.name).then(values =>
      dispatch({
        [field.name]: values.map(({ value }) => ({ id: value, label: value }))
      })
    );
  }, [api, description, field, picklistValues]);

  if (!description || !field) return null;

  const availableOptions = comboboxFilterAndLimit({
    inputValue,
    limit: 10,
    options: picklistValues[field.name] || [],
    selection: []
  });

  return (
    <Combobox
      isOpen={isOpen}
      events={{
        onFocus: () => setIsOpen(true),
        onBlur: () => setIsOpen(false),
        onChange: (event, { value }) => {
          setInputValue(value);
          setIsOpen(true);
        },
        onSelect: (event, data) => {
          if (onSelect) {
            const { id } = data.selection[0];
            onSelect(event, { [field.name]: id });
          } else if (console) {
            console.log('onSelect', event, data);
          }
          setInputValue('');
          setIsOpen(false);
        }
      }}
      options={availableOptions}
      selection={[]}
      value={inputValue}
    />
  );
};

function updatePicklistValues(state, values) {
  return { ...state, ...values };
}

export default PicklistCombobox;
