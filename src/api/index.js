export default dataService => {
  return {
    describeFields: sobject => dataService.describeFields(sobject),
    query: soql => dataService.query(soql)
  };
};
