import React, { createContext, useContext } from 'react';
import { createApi } from '../api';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({
  children,
  settings,
  dataService,
  eventService
}) => {
  const api = createApi(dataService);

  return (
    <AppContext.Provider value={{ api, settings, eventService }}>
      {children}
    </AppContext.Provider>
  );
};
