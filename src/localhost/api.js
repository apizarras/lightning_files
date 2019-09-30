// dev-only stubs for LightningContext params
export const dataService = connection => {
  return {
    describe: sobject =>
      connection
        .describe(sobject)
        .then(({ name, label, labelPlural }) => ({ name, label, labelPlural })),
    describeFields: sobject =>
      connection.describe(sobject).then(description =>
        description.fields.reduce((fields, field) => {
          fields[field.name] = field;
          return fields;
        }, {})
      ),
    describePicklist: (sobject, fieldName) =>
      connection.describe(sobject).then(description => {
        return description.fields.find(f => f.name === fieldName).picklistValues;
      }),
    query: soql => connection.query(soql).then(r => r.records),
    queryCount: soql => connection.query(soql).then(r => r.totalSize),
    restApi: connection.getJSON,
    insertItems: (sobject, items) =>
      new Promise((resolve, reject) =>
        connection.sobject(sobject).create(items, { allOrNone: true }, (err, results) => {
          if (err) return reject(err);
          const updatedRecords = [];
          const updateErrors = [];
          results.forEach(({ id, success, errors }, index) => {
            if (success) updatedRecords.push(id);
            if (errors) updateErrors.push(...errors);
          });

          resolve({ updatedRecords, errors: updateErrors });
        })
      )
  };
};

export const eventService = () => {
  return {
    refreshView: () => console.log('Triggered force:refreshView')
  };
};
