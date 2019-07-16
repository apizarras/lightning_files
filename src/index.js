import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionProvider, useConnection } from './contexts/dev';
import { useSettings } from './contexts/dev/Settings';
import { dataService, eventService } from './api/dev';
import { createComponent } from './index-lightning';

// stubs out AppContext params for local dev
const Component = props => {
  const connection = useConnection();
  const settings = useSettings();

  return createComponent(settings, dataService(connection), eventService());
};

ReactDOM.render(
  <ConnectionProvider>
    <Component />
  </ConnectionProvider>,
  document.getElementById('root')
);
