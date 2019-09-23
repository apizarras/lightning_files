import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { DESIGN_ATTRIBUTES } from './constants';

export function init(component, sessionId, eventService) {
  const containerElement = component.find('root').getElement();
  const aura = window.$A;

  function wrap(method, params, needsParse) {
    return new Promise((resolve, reject) => {
      const action = component.get(`c.${method}`);

      if (params) action.setParams(params);

      action.setCallback(this, response => {
        if (response.getState() === 'SUCCESS') {
          const returnValue = response.getReturnValue();

          try {
            // we have to conditionally parse because metadata types are unsupported by AuraEnabled endpoints
            resolve(needsParse ? JSON.parse(returnValue) : returnValue);
          } catch (e) {
            reject(e);
          }
        }
        if (response.getState() === 'ERROR') {
          reject(response.getError()[0]);
        }
      });

      aura.getCallback(() => aura.enqueueAction(action))();
    });
  }

  const dataService = {
    describe: sobjectType => wrap('describe', { sobjectType }, true),
    describeFields: sobjectType => wrap('describeFields', { sobjectType }, true),
    describePicklist: (sobjectType, fieldName) =>
      wrap('describePicklist', { sobjectType, fieldName }, true),
    query: soql => wrap('query', { soql }),
    queryCount: soql => wrap('countQuery', { soql }),
    restApi: path =>
      wrap('callRest', { sessionId, endpoint: `/services/data/v44.0/${path}` }, true),
    insertItems: (sobjectType, items) =>
      wrap('insertItems', { sobjectType, items: items.map(x => JSON.stringify(x)) })
  };

  const settings = DESIGN_ATTRIBUTES.reduce(
    (settings, { name }) => {
      settings[name] = component.get(`v.${name}`);
      return settings;
    },
    { componentId: component.getGlobalId() }
  );

  ReactDOM.render(
    <App settings={settings} dataService={dataService} eventService={eventService} />,
    containerElement
  );
}
