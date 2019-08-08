import React, { createContext, useContext, useReducer } from 'react';
import { DESIGN_ATTRIBUTES } from '../../constants';

const SettingsContext = createContext();

/** React hook to access lightning design attributes at dev time */
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, dispatch] = useReducer(applyChanges, getDefaultSettings());

  return (
    <SettingsContext.Provider value={[settings, dispatch]}>
      {children}
    </SettingsContext.Provider>
  );
};

export function getDefaultSettings() {
  return DESIGN_ATTRIBUTES.reduce(
    (settings, config) => {
      settings[config.name] = config.defaultValue;
      return settings;
    },
    { componentId: 'DEV' }
  );
}

function applyChanges(state, action) {
  return { ...state, ...action };
}
