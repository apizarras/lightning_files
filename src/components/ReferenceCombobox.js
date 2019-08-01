import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { queryLookupOptions } from '../api/query';
import { Combobox } from '@salesforce/design-system-react';
import comboboxFilterAndLimit from '@salesforce/design-system-react/components/combobox/filter';

const ReferenceCombobox = props => {
  const { query, field, onSelect } = props;
  const { api } = useAppContext();
  const [inputValue, setInputValue] = useState();
  const [options, setOptions] = useState();

  useEffect(() => {
    if (!query || !field || options) return;

    queryLookupOptions(api, query, field).then(values =>
      setOptions(values.map(({ Id, Name }) => ({ id: Id, label: Name })))
    );
  }, [api, field, options, query]);

  if (!query || !field) return null;

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
            const { id, label } = data.selection[0];
            onSelect(event, {
              [field.name]: id,
              [field.relationshipName]: { Name: label }
            });
          } else if (console) {
            console.log('onSelect', event, data);
          }
          setInputValue('');
        }
      }}
      options={availableOptions}
      selection={[]}
      value={inputValue}
    />
  );
};

export default ReferenceCombobox;
