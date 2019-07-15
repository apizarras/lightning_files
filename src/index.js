import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ConnectionContextProvider, { useConnection } from './FX';
import LightningContextProvider from './contexts/LightningContext';
import { dataService, settings, events } from './api/dev';

// stubs out LightningContext params for local dev
const DevLightningContextProvider = ({ children }) => {
  const connection = useConnection();

  return (
    <LightningContextProvider
      dataService={dataService(connection)}
      settings={settings()}
      events={events()}
    >
      {children}
    </LightningContextProvider>
  );
};

ReactDOM.render(
  <ConnectionContextProvider>
    <DevLightningContextProvider>
      <App />
    </DevLightningContextProvider>
  </ConnectionContextProvider>,
  document.getElementById('root')
);
