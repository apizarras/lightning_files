/* eslint-disable no-unused-expressions */
({
  initialize: function(component, event, helper) {
    window.react_rental.initialize(component);
  },

  handleEvent: function(component, event, helper) {
    // stub so lightning knows we want to listen to this event
  }

  // handleRefreshView: function(component, event, helper) {
  //   if (!helper.state.preventRefreshCycle) {
  //     helper.state.preventRefreshCycle = false;

  //     let transport = { mode: 'refreshView', data: {} };
  //     component.get('v.lightningEventsCallback')(transport);
  //   }
  // }
});
