import React, { createContext, useContext } from 'react';
import createApi from '../api';

const LightningContext = createContext();

const LightningContextProvider = ({
  children,
  dataService,
  settings,
  events
}) => {
  const api = createApi(dataService);

  return (
    <LightningContext.Provider value={{ api, settings, events }}>
      {children}
    </LightningContext.Provider>
  );
};

export const useLightningContext = () => useContext(LightningContext);

export default LightningContextProvider;
