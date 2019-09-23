import React, { useState, useEffect } from 'react';
import { ComponentContextProvider, useComponentContext } from './ItemPicker/context';
import ItemPicker from './ItemPicker';
import { IconSettings } from '@salesforce/design-system-react';

export default function LightningComponent(props) {
  const { settings, dataService, eventService } = props;

  return (
    <IconSettings iconPath="/_slds/icons">
      <ComponentContextProvider
        settings={settings}
        dataService={dataService}
        eventService={eventService}>
        <App />
      </ComponentContextProvider>
    </IconSettings>
  );
}

const App = () => {
  const { api, settings } = useComponentContext();
  const [description, setDescription] = useState();

  useEffect(() => {
    async function fetch() {
      if (!settings) return;
      const { pickerSobject } = settings;
      if (!pickerSobject) return;

      const description = await api.describe(pickerSobject);
      setDescription(description);
    }

    fetch();
  }, [api, settings]);

  if (!description) return null;

  const { recordId, targetSobject, targetParentField, targetItemField } = settings;
  const onSelect =
    recordId && targetSobject && targetParentField && targetItemField
      ? items => {
          const targetItems = items.map(({ Id }) => ({
            [targetParentField]: recordId,
            [targetItemField]: Id
          }));

          return api.insertItems(targetSobject, targetItems);
        }
      : null;

  return (
    <ItemPicker
      multiSelect={true}
      actionButtonLabel={targetSobject && settings.actionButtonLabel}
      compact={settings.compact}
      staticFilter={settings.filter}
      description={description}
      onSelect={onSelect}
    />
  );
};
