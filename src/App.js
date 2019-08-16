import React, { useState, useEffect } from 'react';
import { useAppContext } from './contexts/AppContext';
import ItemPicker from './components/ItemPicker';
import FormattedValue from './components/FormattedValue';
import { Card, Modal, Button } from '@salesforce/design-system-react';
import { createLookupFilterClause } from './api/query';

const App = () => {
  const { api, settings } = useAppContext();
  const [description, setDescription] = useState();
  const [displayField, setDisplayField] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [singleSelected, setSingleSelected] = useState();
  const [multiSelected, setMultiSelected] = useState();
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [lookupFilter, setLookupFilter] = useState();
  const [parentFilter, setParentFilter] = useState();

  useEffect(() => {
    async function fetch() {
      if (!settings) return;
      const { pickerSobject, recordId, lookupFieldName } = settings;
      if (!pickerSobject) return;

      const description = await api.describe(pickerSobject);
      setDescription(description);
      setDisplayField(description.fields['Name']);

      const lookupFilter = await createLookupFilterClause(
        api,
        recordId,
        lookupFieldName
      );
      setLookupFilter(lookupFilter);
      setParentFilter(`FX5__Ticket__c = '${recordId}'`);
    }

    fetch();
  }, [api, settings]);

  function onSelect(value) {
    isMultiSelect ? setMultiSelected(value) : setSingleSelected(value);
    setIsOpen(false);
  }

  if (!description) return null;

  return (
    <>
      <Modal
        align="top"
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        size="medium"
      >
        <ItemPicker
          compact={settings.compact}
          multiSelect={isMultiSelect}
          description={description}
          onSelect={onSelect}
          staticFilter={lookupFilter}
        />
      </Modal>

      <Card heading="Single Select Modal" bodyClassName="slds-card__body_inner">
        <Button
          onClick={() => {
            setIsMultiSelect(false);
            setIsOpen(true);
          }}
        >
          {!singleSelected && 'Select Item'}
          <FormattedValue field={displayField} item={singleSelected} />
        </Button>
        {singleSelected && (
          <Button
            assistiveText={{ icon: 'Remove Selection' }}
            iconCategory="utility"
            iconName="close"
            iconVariant="border-filled"
            variant="icon"
            onClick={() => setSingleSelected(null)}
          />
        )}
      </Card>

      <Card heading="Multi Select Modal" bodyClassName="slds-card__body_inner">
        <Button
          onClick={() => {
            setIsMultiSelect(true);
            setIsOpen(true);
          }}
        >
          Select Items
        </Button>
        {multiSelected && (
          <ul>
            {multiSelected.map(item => (
              <li>
                <FormattedValue field={displayField} item={item} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ItemPicker
        compact={settings.compact}
        multiSelect={true}
        description={description}
        staticFilter={parentFilter}
      />
    </>
  );
};

export default App;
