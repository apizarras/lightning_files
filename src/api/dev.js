// dev-only stubs for LightningContext params

export const dataService = connection => {
  return {
    describe: sobject =>
      connection
        .describe(sobject)
        .then(({ name, label, labelPlural }) => ({ name, label, labelPlural })),
    describeFields: sobject =>
      connection.describe(sobject).then(description =>
        description.fields.reduce((fields, field) => {
          fields[field.name] = field;
          return fields;
        }, {})
      ),
    describePicklist: (sobject, fieldName) =>
      connection.describe(sobject).then(description => {
        return description.fields.find(f => f.name === fieldName)
          .picklistValues;
      }),
    searchLayout: sobject =>
      connection.getJSON(`search/layout/?q=${sobject}`).then(r => r[0]),
    query: soql => connection.query(soql).then(r => r.records),
    queryCount: soql => connection.query(soql).then(r => r.totalSize),
    describeLookupFilter: async (objectInfo, fieldName) => {
      const field = objectInfo.fields[fieldName];

      const sourceEntityId = await connection
        .getJSON(
          `tooling/query/?q=SELECT DurableId FROM EntityDefinition WHERE QualifiedApiName='${objectInfo.apiName}'`
        )
        .then(res => res.records[0] && res.records[0].DurableId);

      const targetEntityId = await connection
        .getJSON(
          `tooling/query/?q=SELECT DurableId FROM EntityDefinition WHERE QualifiedApiName='${field.referenceToInfos[0].apiName}'`
        )
        .then(res => res.records[0] && res.records[0].DurableId);

      const sourceFieldId = await connection
        .getJSON(
          `tooling/query/?q=SELECT DurableId FROM FieldDefinition WHERE EntityDefinitionId='${sourceEntityId}' AND QualifiedApiName='${field.apiName}'`
        )
        .then(res => res.records[0] && res.records[0].DurableId);

      const lookupFilters = await connection
        .getJSON(
          `tooling/query/?q=SELECT SourceFieldDefinitionId, Metadata FROM LookupFilter WHERE Active=TRUE AND IsOptional=FALSE AND TargetEntityDefinitionId='${targetEntityId}'`
        )
        .then(res => res.records);

      const filter = lookupFilters.find(
        x => x.SourceFieldDefinitionId === sourceFieldId
      );
      return filter && filter.Metadata;
    },
    recordInfo: recordId => connection.getJSON(`ui-api/record-ui/${recordId}`)
  };
};

export const eventService = () => {
  return {
    triggerLightningEvent: action => {
      // no other lightning components here...just log to console
      console.info('EVENT TRIGGERED', action);
    }
  };
};
