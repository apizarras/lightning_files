export function createApi(dataService) {
  return {
    describe: sobject => {
      return Promise.all([dataService.describe(sobject), dataService.describeFields(sobject)]).then(
        ([description, fields]) => ({ ...description, fields })
      );
    },
    describePicklist: dataService.describePicklist,
    query: dataService.query,
    queryCount: dataService.queryCount,
    searchLayout: sobject => dataService.restApi(`search/layout/?q=${sobject}`).then(r => r[0]),
    recordInfo: recordId => dataService.restApi(`ui-api/record-ui/${recordId}`),
    describeLookupFilter: async (objectInfo, fieldName) => {
      try {
        const field = objectInfo.fields[fieldName];
        if (!field) return;

        const [sourceEntityId, targetEntityId] = await Promise.all([
          dataService
            .restApi(
              `tooling/query/?q=SELECT DurableId FROM EntityDefinition WHERE QualifiedApiName='${objectInfo.apiName}'`
            )
            .then(res => res.records[0] && res.records[0].DurableId),
          dataService
            .restApi(
              `tooling/query/?q=SELECT DurableId FROM EntityDefinition WHERE QualifiedApiName='${field.referenceToInfos[0].apiName}'`
            )
            .then(res => res.records[0] && res.records[0].DurableId)
        ]);
        if (!sourceEntityId || !targetEntityId) return;

        const sourceFieldId = await dataService
          .restApi(
            `tooling/query/?q=SELECT DurableId FROM FieldDefinition WHERE EntityDefinitionId='${sourceEntityId}' AND QualifiedApiName='${field.apiName}'`
          )
          .then(res => res.records[0] && res.records[0].DurableId);
        if (!sourceFieldId) return;

        const developerName =
          'nf_' +
          sourceFieldId
            .split('.')
            .map(sf15to18)
            .join('_');

        const filter = await dataService
          .restApi(
            `tooling/query/?q=SELECT Metadata FROM LookupFilter WHERE Active=TRUE AND IsOptional=FALSE AND DeveloperName='${developerName}'`
          )
          .then(res => res.records && res.records[0]);

        return filter && filter.Metadata;
      } catch (e) {
        console.error(e);
      }
    }
  };
}

// converts a salesforce 15 character id into an 18 character id
function sf15to18(id) {
  if (!id) throw new TypeError('No id given');
  if (typeof id !== 'string') throw new TypeError("The given id isn't a string");
  if (id.length === 18) return id;
  if (id.length !== 15) throw new RangeError("The given id isn't 15 characters long");

  // Generate three last digits of the id
  for (let i = 0; i < 3; i++) {
    let f = 0;

    // For every 5-digit block of the given id
    for (let j = 0; j < 5; j++) {
      // Assign the j-th chracter of the i-th 5-digit block to c
      let c = id.charAt(i * 5 + j);

      // Check if c is an uppercase letter
      if (c >= 'A' && c <= 'Z') {
        // Set a 1 at the character's position in the reversed segment
        f += 1 << j;
      }
    }

    // Add the calculated character for the current block to the id
    id += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ012345'.charAt(f);
  }

  return id;
}
