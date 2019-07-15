import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { LightningContextProvider } from './api/LightningContext';

const init = (containerElement, dataService, settings, events) => {
  ReactDOM.render(
    <LightningContextProvider
      dataService={dataService}
      settings={settings}
      events={events}
    >
      <App />
    </LightningContextProvider>,
    containerElement
  );
};

export { init };
