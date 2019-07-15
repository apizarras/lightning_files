import React, { createContext, useContext } from 'react';

const LightningContext = createContext();

export const useLightningContext = () => useContext(LightningContext);

export const LightningContextProvider = ({
  children,
  dataService,
  settings,
  events
}) => {
  return (
    <LightningContext.Provider value={{ dataService, settings, events }}>
      {children}
    </LightningContext.Provider>
  );
};
