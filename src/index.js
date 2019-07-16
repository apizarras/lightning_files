import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionProvider, useConnection } from './contexts/dev';
import { dataService, settings, events } from './api/dev';
import { createComponent } from './index-lightning';

// stubs out AppContext params for local dev
const Component = props => {
  const connection = useConnection();
  return createComponent(dataService(connection), settings(), events());
};

ReactDOM.render(
  <ConnectionProvider>
    <Component />
  </ConnectionProvider>,
  document.getElementById('root')
);
