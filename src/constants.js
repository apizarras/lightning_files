// https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_attribute.htm

export const DESIGN_ATTRIBUTES = [
  {
    name: 'compact',
    label: 'Compact',
    description: 'Use condensed display mode',
    type: 'boolean',
    defaultValue: true
  },
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
    required: 'true',
    name: 'pickerSobject',
    label: 'Picker Object',
    description: 'Objects to list in the picker',
    type: 'string',
    defaultValue: 'Contact'
  },
  {
    name: 'pickerLookupField',
    label: 'Picker Lookup Field',
    description: 'Lookup field on picker objects to filter by',
    type: 'string'
  },
  {
    name: 'pickerLookupValue',
    label: 'Picker Lookup Value',
    description: 'SOQL path from current page object',
    type: 'string'
  },
  {
    name: 'filter',
    label: 'Picker Filter',
    description: 'SOQL filter clause applied to picker objects',
    type: 'string'
  },
  {
    name: 'actionButtonLabel',
    label: 'Action Button Label',
    description: 'Label for Target Object create button',
    type: 'string'
  },
  {
    name: 'targetSobject',
    label: 'Target Object',
    description: 'Object ,to create using selected picker items',
    type: 'string'
  },
  {
    name: 'targetParentField',
    label: 'Target Object Parent Lookup Field',
    description: 'Parent field on object to create using selected picker items',
    type: 'string'
  },
  {
    name: 'targetItemField',
    label: 'Target Object Item Field',
    description: 'Item field on object to create using selected picker items',
    type: 'string'
  }
];

export const MESSAGE_TYPES = ['I did something good', 'I did something bad'];
