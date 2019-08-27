export function createApi(dataService) {
  return {
    describe: sobject => {
      return Promise.all([
        dataService.describe(sobject),
        dataService.describeFields(sobject)
      ]).then(([description, fields]) => ({ ...description, fields }));
    },
    describePicklist: dataService.describePicklist,
    searchLayout: dataService.searchLayout,
    query: dataService.query,
    queryCount: dataService.queryCount,
    recordInfo: recordId => dataService.restAPI(`ui-api/record-ui/${recordId}`),
    describeLookupFilter: async (objectInfo, fieldName) => {
      try {
        const field = objectInfo.fields[fieldName];
        if (!field) return;

        const sourceEntityId = await dataService
          .restAPI(
            `tooling/query/?q=SELECT DurableId FROM EntityDefinition WHERE QualifiedApiName='${objectInfo.apiName}'`
          )
          .then(res => res.records[0] && res.records[0].DurableId);
        if (!sourceEntityId) return;

        const targetEntityId = await dataService
          .restAPI(
            `tooling/query/?q=SELECT DurableId FROM EntityDefinition WHERE QualifiedApiName='${field.referenceToInfos[0].apiName}'`
          )
          .then(res => res.records[0] && res.records[0].DurableId);
        if (!targetEntityId) return;

        const sourceFieldId = await dataService
          .restAPI(
            `tooling/query/?q=SELECT DurableId FROM FieldDefinition WHERE EntityDefinitionId='${sourceEntityId}' AND QualifiedApiName='${field.apiName}'`
          )
          .then(res => res.records[0] && res.records[0].DurableId);
        if (!sourceFieldId) return;

        const lookupFilters = await dataService
          .restAPI(
            `tooling/query/?q=SELECT SourceFieldDefinitionId, Metadata FROM LookupFilter WHERE Active=TRUE AND IsOptional=FALSE AND TargetEntityDefinitionId='${targetEntityId}'`
          )
          .then(res => res.records);

        const filter = lookupFilters.find(
          x => x.SourceFieldDefinitionId === sourceFieldId
        );
        return filter && filter.Metadata;
      } catch (e) {
        console.error(e);
      }
    }
  };
}
