import React, { createContext, useState } from 'react';

export const LightningContext = createContext();

export const LightningContextProvider = ({ children, dataService, settings, events }) => {
  const [forceRefresh, setForceRefresh] = useState(null);
  const refresh = { setForceRefresh, forceRefresh };
  const handleLightningSelect = rowIds => {
    return events.handleSelectedRows(rowIds);
  };

  return (
    <LightningContext.Provider
      value={{ dataService, settings, events, refresh, handleLightningSelect }}>
      {children}
    </LightningContext.Provider>
  );
};
