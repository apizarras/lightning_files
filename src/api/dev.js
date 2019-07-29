// dev-only stubs for LightningContext params

export const dataService = connection => {
  return {
    describe: sobject => connection.describe(sobject),
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
