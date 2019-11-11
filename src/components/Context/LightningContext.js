import React, { createContext, useState } from 'react';

export const LightningContext = createContext();

export const LightningContextProvider = ({ children, dataService, settings, events }) => {
  const [forceRefresh, setForceRefresh] = useState(null);
  const refresh = { setForceRefresh, forceRefresh };
console.log("data service: ", dataService);
  const handleLightningSelect = rowIds => {
    return events.handleSelectedRows(rowIds);
  };

  const onOpenRtf = (mode, rowId, apiName, label, callback) => {
    return events.handleOpenRtf(mode, rowId, apiName, label, callback);
  };

  return (
    <LightningContext.Provider
      value={{ dataService, settings, events, refresh, handleLightningSelect, onOpenRtf }}>
      {children}
    </LightningContext.Provider>
  );
};
