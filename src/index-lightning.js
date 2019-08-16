import React from 'react';
import ReactDOM from 'react-dom';
import { DESIGN_ATTRIBUTES } from './constants';
import { AppContextProvider } from './ItemPicker/contexts/AppContext';
import { handleAppEvent } from './ItemPicker/api/events';
import { Settings, IconSettings } from '@salesforce/design-system-react';
import App from './App';

export default function LightningComponent(props) {
  const { settings, dataService, eventService } = props;

  return (
    <IconSettings iconPath="/_slds/icons">
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

  const settings = DESIGN_ATTRIBUTES.reduce(
    (settings, { name }) => {
      settings[name] = component.get(`v.${name}`);
      return settings;
    },
    { componentId: component.getGlobalId() }
  );

  function wrap(method, params, jsonparse) {
    return new Promise((resolve, reject) => {
      const action = component.get(`c.${method}`);
      if (action) {
        action.setParams(params);
        action.setCallback(this, response => {
          if (response.getState() === 'SUCCESS') {
            var result = response.getReturnValue();
            resolve(jsonparse ? JSON.parse(result) : result);
          }
          if (response.getState() === 'ERROR') {
            reject(response.getError()[0]);
          }
        });
        aura.getCallback(function() {
          aura.enqueueAction(action);
        })();
      }
    });
  }

  const dataService = {
    describe: sobjectType => wrap('describe', { sobjectType }, true),
    describeFields: sobjectType =>
      wrap('describeFields', { sobjectType }, true),
    describePicklist: (sobjectType, fieldName) =>
      wrap('describePicklist', { sobjectType, fieldName }, true),
    query: soql => wrap('query', { soql }),
    queryCount: soql => wrap('query', { soql })
  };

  const eventService = {
    triggerLightningEvent: action => {
      component
        .getEvent('FX5:ACTION')
        .setParams(action)
        .fire();
    }
  };

  // pass lightning application events to react
  // expecting event param to look like: { type, payload }
  component.addEventHandler('FX5:ACTION', (component, event) =>
    handleAppEvent(event.getParams())
  );

  const appElement = component.find('root').getElement();
  Settings.appElement(appElement);

  ReactDOM.render(
    <LightningComponent
      settings={settings}
      dataService={dataService}
      eventService={eventService}
    />,
    appElement
  );
}
