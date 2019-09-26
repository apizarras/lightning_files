import React, { useState, useEffect } from 'react';
import { ComponentContextProvider, useComponentContext } from './ItemPicker/context';
import { createParentFilterClause, createPricebookFilterClauses } from './ItemPicker/api/query';
import ItemPicker from './ItemPicker';
import { IconSettings } from '@salesforce/design-system-react';

export default function LightningComponent(props) {
  const { settings, dataService, eventService } = props;

  return (
    <IconSettings iconPath="/_slds/icons">
      <ComponentContextProvider
        settings={settings}
        dataService={dataService}
        eventService={eventService}>
        <App />
      </ComponentContextProvider>
    </IconSettings>
  );
}

async function isExtendedPricingEnabled(api, settings) {
  const { pickerSobject, sObjectName, recordId } = settings;
  if (pickerSobject !== 'FX5__Price_Book_Item__c') return false;
  if (!sObjectName || !recordId) return false;
  if (sObjectName !== 'FX5__Ticket__c' && sObjectName !== 'FX5__Quote__c') return false;

  let fieldPath = 'Enable_Extended_Pricing__c';
  if (sObjectName === 'FX5__Ticket__c') {
    fieldPath = 'FX5__Job__r.Enable_Extended_Pricing__c';
  }

  return await api
    .query(`SELECT ${fieldPath} FROM ${sObjectName} WHERE Id='${recordId}'`)
    .then(results => {
      const record = results && results[0];
      if (!record) return false;

      if (sObjectName === 'FX5__Ticket__c') {
        return record.FX5__Job__r.Enable_Extended_Pricing__c;
      } else {
        return record.Enable_Extended_Pricing__c;
      }
    })
    .catch(e => false);
}

const App = () => {
  const { api, settings } = useComponentContext();
  const [description, setDescription] = useState();
  const [filter, setFilter] = useState(null);
  const [dynamicFilters, setDynamicFilters] = useState(null);

  useEffect(() => {
    async function fetch() {
      if (!settings) return;
      const { pickerSobject } = settings;
      if (!pickerSobject) return;

      const description = await api.describe(pickerSobject);
      setDescription(description);

      const extendedPricingEnabled = await isExtendedPricingEnabled(api, settings);

      if (extendedPricingEnabled) {
        const pricebookFilters = await createPricebookFilterClauses(api, settings, description);
        setDynamicFilters(pricebookFilters);
        setFilter(settings.filter);
      } else {
        const parentFilter = await createParentFilterClause(api, settings);
        setFilter([parentFilter, settings.filter].filter(Boolean).join(' AND '));
      }
    }

    fetch();
  }, [api, settings]);

  if (!description || filter === null) return null;

  const { recordId, targetSobject, targetParentField, targetItemField } = settings;
  const onSelect =
    recordId && targetSobject && targetParentField && targetItemField
      ? items => {
          const targetItems = items.map(({ Id }) => ({
            [targetParentField]: recordId,
            [targetItemField]: Id
          }));

          return api.insertItems(targetSobject, targetItems);
        }
      : null;

  return (
    <ItemPicker
      multiSelect={true}
      actionButtonLabel={targetSobject && settings.actionButtonLabel}
      compact={settings.compact}
      staticFilter={filter}
      dynamicFilters={dynamicFilters}
      description={description}
      onSelect={onSelect}
    />
  );
};
