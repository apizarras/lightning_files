import React from 'react';
import ReactDOM from 'react-dom';
import { AppContextProvider } from './contexts/AppContext';
import { IconSettings } from '@salesforce/design-system-react';
import App from './App';

export function createComponent(settings, dataService, eventService) {
  return (
    <IconSettings iconPath="/assets/icons">
      <AppContextProvider
        settings={settings}
        dataService={dataService}
        eventService={eventService}
      >
        <App />
      </AppContextProvider>
    </IconSettings>
  );
}

export function initialize(containerElement, dataService, settings, events) {
  ReactDOM.render(
    createComponent(dataService, settings, events),
    containerElement
  );
}
