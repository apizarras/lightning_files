// dev-only stubs for LightningContext params

export const dataService = connection => {
  return {
    theme: () => connection.getJSON('theme'),
    describe: sobject => connection.describe(sobject),
    query: soql => connection.query(soql).then(r => r.records)
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
