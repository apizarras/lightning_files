import React, { createContext, useContext } from 'react';
import { createApi } from '../api';

export const ComponentContext = createContext();

export const useComponentContext = () => useContext(ComponentContext);

export const ComponentContextProvider = ({ children, settings, dataService, eventService }) => {
  const api = createApi(dataService);
  return (
    <ComponentContext.Provider value={{ api, settings, eventService }}>
      {children}
    </ComponentContext.Provider>
  );
};
