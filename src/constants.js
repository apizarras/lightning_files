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
  }
];

export const MESSAGE_TYPES = ['I did something good', 'I did something bad'];
