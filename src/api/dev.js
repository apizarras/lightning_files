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
        return description.fields.find(f => f.name === fieldName)
          .picklistValues;
      }),
    query: soql => connection.query(soql).then(r => r.records),
    queryScalar: soql => connection.query(soql).then(r => r.totalSize)
  };
};

export const eventService = () => {
  return {
    triggerLightningEvent: action => {
      // no other lightning components here...just log to console
      console.info('EVENT TRIGGERED', action);
    }
  };
};
