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
  const defaults = DESIGN_ATTRIBUTES.reduce(
    (settings, config) => {
      settings[config.name] = config.defaultValue;
      return settings;
    },
    { componentId: 'DEV' }
  );
  return loadSettings() || defaults;
}

function applyChanges(state, action) {
  const settings = { ...state, ...action };
  saveSettings(settings);
  return settings;
}

function saveSettings(settings) {
  try {
    localStorage.setItem('dev-fxl-settings', JSON.stringify(settings));
  } catch (e) {}
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('dev-fxl-settings');
    return saved && JSON.parse(saved);
  } catch (e) {}
}
