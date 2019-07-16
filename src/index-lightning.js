import React from 'react';
import ReactDOM from 'react-dom';
import { AppContextProvider } from './contexts/AppContext';
import App from './App';

export function createComponent(dataService, settings, events) {
  return (
    <AppContextProvider
      dataService={dataService}
      settings={settings}
      events={events}
    >
      <App />
    </AppContextProvider>
  );
}

export function initialize(containerElement, dataService, settings, events) {
  ReactDOM.render(
    createComponent(dataService, settings, events),
    containerElement
  );
}
