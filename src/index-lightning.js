import React from 'react';
import ReactDOM from 'react-dom';
import { AppContextProvider } from './contexts/AppContext';
import { IconSettings } from '@salesforce/design-system-react';
import { DESIGN_ATTRIBUTES } from './constants';
import { handleAppEvent } from './api/events';
import App from './App';

export default function LightningComponent(props) {
  const { settings, dataService, eventService } = props;

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

export function initialize(component) {
  const aura = window.$A;

  function wrap(method, params, needsParse) {
    return new Promise((resolve, reject) => {
      const action = component.get(`c.${method}`);

      action.setParams(params);
      action.setCallback(this, function(response) {
        const state = response.getState();

        if (state === 'SUCCESS') {
          //we have to json parse because metadata types are unsupported by AuraEnabled endpoints
          const returnValue = response.getReturnValue();
          resolve(needsParse ? JSON.parse(returnValue) : returnValue);
        }

        if (state === 'ERROR') {
          reject(response.getError()[0]);
        }
      });

      aura.getCallback(function() {
        aura.enqueueAction(action);
      })();
    });
  }

  const settings = DESIGN_ATTRIBUTES.map(({ name }) =>
    component.get(`v.${name}`)
  );

  const dataService = {
    describe: sobjectType => wrap('describe', { sobjectType }, true),
    query: soql => wrap('query', { soql })
  };

  const eventService = {
    triggerLightningEvent: action => {
      aura
        .get('e.FX5:ACTION')
        .setParams(action)
        .fire();
    }
  };

  // pass lightning application events to react
  // expecting event param to look like: { type, payload }
  component.addEventHandler('FX5:ACTION', (component, event) =>
    handleAppEvent(event.getParams())
  );

  ReactDOM.render(
    <LightningComponent
      settings={settings}
      dataService={dataService}
      eventService={eventService}
    />,
    component.find('root')
  );
}
