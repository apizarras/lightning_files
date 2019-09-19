// dev-only stubs for LightningContext params
import { createEventService } from '../ItemPicker/api/events';

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
    restApi: connection.getJSON
  };
};

export const eventService = () => {
  return createEventService({
    sendMessage: message => console.log('SEND LIGHTNING MESSAGE', message),
    addMessageHandler: () => {}
  });
};
