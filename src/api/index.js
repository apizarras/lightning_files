export function createApi(dataService) {
  return {
    describe: sobject => {
      return Promise.all([
        dataService.describe(sobject),
        dataService.describeFields(sobject)
      ]).then(([description, fields]) => ({ ...description, fields }));
    },
    describePicklist: dataService.describePicklist,
    describeLookupFilter: dataService.describeLookupFilter,
    searchLayout: sobject => dataService.searchLayout(sobject),
    query: soql => dataService.query(soql),
    queryCount: soql => dataService.queryCount(soql),
    recordInfo: recordId => dataService.recordInfo(recordId)
  };
}
