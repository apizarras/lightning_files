import React from 'react';
import ReactDOM from 'react-dom';
import {
  ConnectionProvider,
  useConnection,
  useSettings
} from './localhost/context';
import { dataService, eventService } from './localhost/api';
import LightningComponent from './index-lightning';
import { Settings } from '@salesforce/design-system-react';

const appElement = document.getElementById('root');
Settings.setAppElement(appElement);

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
  appElement
);
