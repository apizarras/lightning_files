import React, { useState, useEffect } from 'react';
import { useComponentContext } from '../context';
import { queryLookupOptions } from '../api/query';
import { Combobox } from '@salesforce/design-system-react';
import comboboxFilterAndLimit from '@salesforce/design-system-react/components/combobox/filter';

const ReferenceCombobox = props => {
  const { className, query, field, onSelect } = props;
  const { api } = useComponentContext();
  const [inputValue, setInputValue] = useState();
  const [options, setOptions] = useState();

  useEffect(() => {
    if (!query || !field) return;

    queryLookupOptions(api, query, field).then(values =>
      setOptions(values.map(({ Id, Name }) => ({ id: Id, label: Name })))
    );
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
