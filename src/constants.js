// https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_attribute.htm

export const DESIGN_ATTRIBUTES = [
  {
    name: 'sObjectName',
    label: 'Page Object API Name (from Salesforce)',
    type: 'string',
    defaultValue: 'FX5__Ticket__c'
  },
  {
    name: 'recordId',
    label: 'Page Object Record Id (from Salesforce)',
    type: 'string',
    defaultValue: 'a0p1N00000CHOabQAH'
  },
  {
    name: 'pickerSobject',
    label: 'Picker Object API Name',
    type: 'string',
    defaultValue: 'FX5__Ticket_Item__c'
  },
  {
    name: 'pickerLookupField',
    label: 'Lookup Field API Name',
    type: 'string',
    defaultValue: 'FX5__Ticket__c'
  },
  {
    name: 'compact',
    label: 'Compact',
    description: 'Display condensed rows in data table',
    type: 'boolean',
    defaultValue: true
  }
];

export const MESSAGE_TYPES = ['I did something good', 'I did something bad'];
