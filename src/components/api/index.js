export function createApi(dataService) {
  function toolingQuery(soql) {
    return dataService.restApi(`tooling/query/?q=${encodeURIComponent(soql)}`);
  }

  return {
    describe: sobject => {
      return Promise.all([dataService.describe(sobject), dataService.describeFields(sobject)]).then(
        ([description, fields]) => ({ ...description, fields })
      );
    },
    describeGlobal: dataService.describeGlobal,
    deleteItems: dataService.deleteItems,
    downloadFile: dataService.downloadFile,
    previewFile: dataService.previewFile,
    fetchDescription: dataService.fetchDescription,
    fetchFiles: dataService.fetchFiles,
    query: dataService.query,
    queryCount: dataService.queryCount,
    insertItems: dataService.insertItems,
    uploadFile: dataService.uploadFile,
    updateItems: dataService.updateItems
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
