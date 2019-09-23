import React, { useState, useEffect } from 'react';
import { ComponentContextProvider, useComponentContext } from './ItemPicker/context';
import { createParentFilterClause } from './ItemPicker/api/query';
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
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    async function fetch() {
      if (!settings) return;
      const { pickerSobject } = settings;
      if (!pickerSobject) return;

      const description = await api.describe(pickerSobject);
      setDescription(description);
      const lookupFilterClause = await createParentFilterClause(api, settings);
      setFilter([lookupFilterClause, settings.filter].filter(Boolean).join(' AND '));
    }

    fetch();
  }, [api, settings]);

  if (!description || filter === null) return null;

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
      staticFilter={filter}
      description={description}
      onSelect={onSelect}
    />
  );
};
