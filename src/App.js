import React, { useState, useEffect } from 'react';
import { ComponentContextProvider, useComponentContext } from './components/Context/context'
import { createParentFilterClause, createPricebookFilterClauses } from './components/api/query';
import FileView from './components/FileView';
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
  console.log("connection/api: ", api);

  useEffect(() => {
    async function fetch() {
      if (!settings) return;
      const { sObjectName } = settings;
      if (!sObjectName) return;

      const description = await api.describe(sObjectName);
      setDescription(description);
    }

    fetch();
  }, [api, settings]);

  if (!description) return null;

  return (
    <FileView description={description}/>
  );
};
