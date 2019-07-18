export function createApi(dataService) {
  return {
    describe: sobject => dataService.describe(sobject),
    query: soql => dataService.query(soql)
  };
}
