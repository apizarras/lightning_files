import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import FxApp, { useConnection } from './FX';
import { LightningContextProvider } from './contexts/LightningContext';
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
  <FxApp>
    <DevLightningContextProvider>
      <App />
    </DevLightningContextProvider>
  </FxApp>,
  document.getElementById('root')
);
