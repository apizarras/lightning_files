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
    defaultValue: '/a1c2a0000003OHRAA2'
  }
];

export const MESSAGE_TYPES = ['I did something good', 'I did something bad'];

export const CONTENTDOCUMENTLINK_FIELDS = [
  "LinkedEntityId",
  "LinkedEntity.Type",
  "ContentDocument.Id",
  "ContentDocument.CreatedBy.Name",
  "ContentDocument.LatestPublishedVersion.Id",
  "ContentDocument.LatestPublishedVersion.Title",
  "ContentDocument.LatestPublishedVersion.PathOnClient",
  "ContentDocument.LatestPublishedVersion.ContentSize",
  "ContentDocument.LatestPublishedVersion.CreatedBy.Name",
  "ContentDocument.LatestPublishedVersion.CreatedDate",
  "ContentDocument.LatestPublishedVersion.LastModifiedDate",
  "ContentDocument.LatestPublishedVersion.LastModifiedBy.Name",
  "ContentDocument.LatestPublishedVersion.FX5__Sync__c",
]
