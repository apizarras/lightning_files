export function createApi(dataService) {
  return {
    describe: sobject => {
      return Promise.all([
        dataService.describe(sobject),
        dataService.describeFields(sobject)
      ]).then(([description, fields]) => ({ ...description, fields }));
    },
    describePicklist: (sobject, fieldName) =>
      dataService.describePicklist(sobject, fieldName),
    query: soql => dataService.query(soql),
    queryScalar: soql => dataService.queryScalar(soql)
  };
}
