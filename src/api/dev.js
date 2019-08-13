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

      const sourceEntity = await connection.tooling
        .sobject('EntityDefinition')
        .find({ QualifiedApiName: objectInfo.apiName });

      const sourceField = await connection.tooling
        .sobject('FieldDefinition')
        .find({
          EntityDefinitionId: sourceEntity[0].DurableId,
          QualifiedApiName: field.apiName
        });

      const targetEntity = await connection.tooling
        .sobject('EntityDefinition')
        .find({ QualifiedApiName: field.referenceToInfos[0].apiName });

      const filters = await connection.tooling.sobject('LookupFilter').find({
        TargetEntityDefinitionId: targetEntity[0].DurableId
      });

      return filters.find(
        x => x.SourceFieldDefinitionId === sourceField[0].DurableId
      );
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
