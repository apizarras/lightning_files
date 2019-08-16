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
    searchLayout: dataService.searchLayout,
    query: dataService.query,
    queryCount: dataService.queryCount,
    recordInfo: dataService.recordInfo
  };
}
