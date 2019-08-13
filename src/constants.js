// https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_attribute.htm

export const DESIGN_ATTRIBUTES = [
  {
    name: 'sObjectName',
    label: 'Page Object API Name (from Salesforce)',
    type: 'string',
    defaultValue: 'FX5__Job__c'
  },
  {
    name: 'recordId',
    label: 'Page Record Id (from Salesforce)',
    type: 'string',
    defaultValue: 'a0G0H00000WKByDUAX'
  },
  {
    name: 'fieldName',
    label: 'Field API Name',
    type: 'string',
    defaultValue: 'FX5__Price_Book__c'
  },
  {
    name: 'pickerSobject',
    label: 'Picker Object API Name',
    type: 'string',
    defaultValue: 'FX5__Price_Book__c'
  },
  {
    name: 'restrictedFields',
    label: 'Restricted Fields',
    description:
      'Hide a set of fields from the user. Defined as a set of comma separated field API names',
    type: 'string'
    // defaultValue:
    //   'FX5__Breadcrumb__c,FX5__Catalog_Classification__c,FX5__CatalogItemPriceBook__c,FX5__Catalog_Price_Book_Index__c,FX5__Enable_Dynamic_Parenting__c,FX5__Catalog_Allow_Dynamic_Parenting__c,FX5__Ticket_Item_Record_Type__c,FX5__Sequence_Number__c,FX5__Requires_Parent_Item__c'
  },
  {
    name: 'hideSystemFields',
    label: 'Hide System Fields',
    description:
      'Prevent system fields like IsDeleted and CreatedBy from appearing to the user',
    type: 'boolean',
    defaultValue: true
  },
  {
    name: 'compact',
    label: 'Compact',
    description: 'Display condensed rows in data table',
    type: 'boolean',
    defaultValue: true
  }
  // {
  //   name: 'defaultColumns',
  //   label: 'Default Columns',
  //   description: 'Comma separated field API names',
  //   type: 'picklist',
  //   options: ['option1', 'option2', 'option3'],
  //   defaultValue: ''
  // }
];

export const ACTION_TYPES = ['I did something good', 'I did something bad'];

export const SYSTEM_FIELDS = [
  'Id',
  'CurrencyIsoCode',
  'IsDeleted',
  'CreatedBy',
  'CreatedById',
  'CreatedDate',
  'CurrencyIsoCode',
  'LastModifiedBy',
  'LastModifiedById',
  'LastModifiedDate',
  'LastReferencedDate',
  'LastViewedDate',
  'SystemModstamp'
];
