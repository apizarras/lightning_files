import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionProvider, useConnection, useSettings } from './contexts/dev';
import { dataService, eventService } from './api/dev';
import LightningComponent from './index-lightning';

// stubs out AppContext params for local dev
const Component = props => {
  const connection = useConnection();
  const [settings] = useSettings();

  return (
    <LightningComponent
      settings={settings}
      dataService={dataService(connection)}
      eventService={eventService()}
    />
  );
};

ReactDOM.render(
  <ConnectionProvider>
    <Component />
  </ConnectionProvider>,
  document.getElementById('root')
);
