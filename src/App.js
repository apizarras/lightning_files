import React, { useState, useEffect } from 'react';
import { useComponentContext } from './ItemPicker/context';
import ItemPicker from './ItemPicker';
import FormattedValue from './ItemPicker/components/FormattedValue';
import { createLookupFilterClause } from './ItemPicker/api/query';
import { Card, Modal, Button } from '@salesforce/design-system-react';

const App = () => {
  const { api, settings } = useComponentContext();
  const [description, setDescription] = useState();
  const [lookupFilter, setLookupFilter] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [singleSelected, setSingleSelected] = useState();
  const [multiSelected, setMultiSelected] = useState();

  useEffect(() => {
    async function fetch() {
      if (!settings) return;
      const { recordId, pickerSobject, pickerLookupField } = settings;
      if (!pickerSobject) return;

      const description = await api.describe(pickerSobject);
      setDescription(description);

      const lookupFilter = await createLookupFilterClause(
        api,
        recordId,
        pickerLookupField
      );
      setLookupFilter(lookupFilter);
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
          staticFilter={lookupFilter}
          onSelect={onSelect}
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
          <FormattedValue
            field={description.fields['Name']}
            item={singleSelected}
          />
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
                <FormattedValue
                  field={description.fields['Name']}
                  item={item}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ItemPicker
        compact={settings.compact}
        multiSelect={true}
        description={description}
        staticFilter={`FX5__Ticket__c = '${settings.recordId}'`}
      />
    </>
  );
};

export default App;
