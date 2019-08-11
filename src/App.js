import React, { useState, useEffect } from 'react';
import { useAppContext } from './contexts/AppContext';
import ItemPicker from './components/ItemPicker';
import FormattedValue from './components/FormattedValue';
import { Card, Modal, Button } from '@salesforce/design-system-react';

const App = () => {
  const { api, settings } = useAppContext();
  const [description, setDescription] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [singleSelected, setSingleSelected] = useState();
  const [multiSelected, setMultiSelected] = useState();
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const field = { name: 'FX5__Catalog_Description__c', type: 'string' };
  const staticFilters = [
    {
      field: { name: 'FX5__Ticket_Item_Record_Type__c', type: 'string' },
      item: { FX5__Ticket_Item_Record_Type__c: 'Labor' }
    },
    {
      field: { name: 'FX5__Price_Book__c', type: 'reference' },
      item: { FX5__Price_Book__c: 'a0Ji0000001sfVzEAI' }
    }
  ];

  useEffect(() => {
    async function fetch() {
      if (!settings.sobject) return;
      const description = await api.describe(settings.sobject);
      setDescription(description);
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
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        size="medium"
      >
        <ItemPicker
          settings={settings}
          description={description}
          isMultiSelect={isMultiSelect}
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
          <FormattedValue field={field} item={singleSelected} />
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

      {/* <Card heading="Multi Select Modal" bodyClassName="slds-card__body_inner">
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
                <FormattedValue field={field} item={item} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ItemPicker
        settings={settings}
        description={description}
        isMultiSelect={true}
      /> */}

      {/* <ItemPicker
        settings={{
          ...settings,
          staticFilters,
          restrictedFields: staticFilters.map(({ field }) => field.name)
        }}
        description={description}
        isMultiSelect={true}
      /> */}
    </>
  );
};

export default App;
