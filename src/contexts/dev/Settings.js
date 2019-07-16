import React, { createContext, useContext, useReducer } from 'react';
import { DESIGN_ATTRIBUTES } from '../../constants';
import {
  Input,
  Checkbox,
  RadioGroup,
  Radio,
  Button
} from '@salesforce/design-system-react';

const SettingsContext = createContext();

/** React hook to access lightning component settings at dev time */
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, dispatch] = useReducer(updateSettings, getDefaultSettings());

  return (
    <SettingsContext.Provider value={[settings, dispatch]}>
      {children}
    </SettingsContext.Provider>
  );
};

export const DesignAttributesEditor = props => {
  const [settings, dispatch] = useSettings();
  const [changes, captureChange] = useReducer(updateSettings, { ...settings });

  function onChange(key, value) {
    captureChange({ [key]: value });
  }

  function reset() {
    const defaults = getDefaultSettings();
    captureChange(defaults);
    dispatch(defaults);
  }

  function save() {
    dispatch(changes);
  }

  return (
    <div className="slds-form slds-form_stacked slds-m-top_medium slds-border_top slds-clearfix">
      <h1 className="slds-text-heading_small slds-p-vertical_medium">
        Design Attributes
      </h1>
      {DESIGN_ATTRIBUTES.map(config => getEditor(config, changes, onChange))}
      <div className="slds-m-top_medium">
        <Button variant="base" label="Reset to defaults" onClick={reset} />
        <Button
          className="slds-float_right"
          variant="brand"
          label="Update Settings"
          onClick={save}
        />
      </div>
    </div>
  );
};

function getEditor(config, settings, onChange) {
  const { key, label, type, options } = config;

  switch (type) {
    case 'boolean':
      return (
        <Checkbox
          label={label}
          checked={settings[key]}
          onChange={checked => onChange(key, checked)}
        />
      );
    case 'picklist':
      return (
        <RadioGroup
          labels={{ label }}
          onChange={e => onChange(key, e.target.value)}
        >
          {options.map(option => (
            <Radio
              key={option}
              value={option}
              label={option}
              checked={settings[key] === option}
              variant="base"
            />
          ))}
        </RadioGroup>
      );
    default:
      return (
        <Input
          label={label}
          value={settings[key]}
          onChange={e => onChange(key, e.target.value)}
        />
      );
  }
}

function getDefaultSettings() {
  return DESIGN_ATTRIBUTES.reduce((settings, config) => {
    settings[config.key] = config.defaultValue;
    return settings;
  }, {});
}

function updateSettings(state, action) {
  return { ...state, ...action };
}
