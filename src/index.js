import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionProvider, useConnection, useSettings } from './localhost/context';
import { dataService, eventService } from './localhost/api';
import { Settings } from '@salesforce/design-system-react';
import App from './App';

const appElement = document.getElementById('root');
Settings.setAppElement(appElement);

// stubs out context params for local dev
const Component = props => {
  const [settings] = useSettings();
  const connection = useConnection();

  return (
    <App settings={settings} dataService={dataService(connection)} eventService={eventService()} />
  );
};

ReactDOM.render(
  <ConnectionProvider>
    <Component />
  </ConnectionProvider>,
  appElement
);
