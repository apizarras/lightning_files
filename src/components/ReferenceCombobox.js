import React, { useState, useEffect, useReducer } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { queryLookupOptions } from '../api/query';
import { Combobox } from '@salesforce/design-system-react';
import comboboxFilterAndLimit from '@salesforce/design-system-react/components/combobox/filter';

const ReferenceCombobox = props => {
  const { query, field, onSelect } = props;
  const { api } = useAppContext();
  const [inputValue, setInputValue] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [lookupValues, dispatch] = useReducer(updateLookupValues, {});

  useEffect(() => {
    if (!query || !field || lookupValues[field.name]) return;

    queryLookupOptions(api, query, field).then(values =>
      dispatch({
        [field.name]: values.map(({ Id, Name }) => ({ id: Id, label: Name }))
      })
    );
  }, [api, field, lookupValues, query]);

  if (!query || !field) return null;

  const availableOptions = comboboxFilterAndLimit({
    inputValue,
    limit: 10,
    options: lookupValues[field.name] || [],
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
            const { id, label } = data.selection[0];
            onSelect(event, {
              [field.name]: id,
              [field.relationshipName]: { Name: label }
            });
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

function updateLookupValues(state, values) {
  return { ...state, ...values };
}

export default ReferenceCombobox;
