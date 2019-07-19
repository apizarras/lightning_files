export function createApi(dataService) {
  return {
    theme: () => dataService.theme(),
    describe: sobject => dataService.describe(sobject),
    query: soql => dataService.query(soql)
  };
}
