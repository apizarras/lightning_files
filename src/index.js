import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionProvider, useConnection } from './contexts/dev';
import { settings, dataService, eventService } from './api/dev';
import { createComponent } from './index-lightning';

// stubs out AppContext params for local dev
const Component = props => {
  const connection = useConnection();
  return createComponent(settings(), dataService(connection), eventService());
};

ReactDOM.render(
  <ConnectionProvider>
    <Component />
  </ConnectionProvider>,
  document.getElementById('root')
);
