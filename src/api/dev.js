// dev-only stubs for LightningContext params

export const dataService = connection => {
  return {
    describeFields: sobject =>
      connection.describe(sobject).then(description =>
        description.fields.reduce((collection, field) => {
          collection[field.name] = field;
          return collection;
        }, {})
      ),
    query: soql => connection.query(soql).then(r => r.records)
  };
};

export const settings = () => {
  return {};
};

export const events = () => {
  return {};
};
