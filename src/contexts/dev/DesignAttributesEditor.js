import React, { useReducer } from 'react';
import { useSettings, getDefaultSettings } from './Settings';
import { DESIGN_ATTRIBUTES } from '../../constants';
import {
  Input,
  Checkbox,
  RadioGroup,
  Radio,
  Button
} from '@salesforce/design-system-react';

const DesignAttributesEditor = props => {
  const [settings, dispatch] = useSettings();
  const [changes, captureChange] = useReducer(applyChanges, { ...settings });

  function onChange(name, value) {
    captureChange({ [name]: value });
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

// https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_attribute.htm
function getEditor(config, settings, onChange) {
  const { name, label, type, options } = config;

  switch (type) {
    case 'boolean':
      return (
        <Checkbox
          label={label}
          checked={settings[name]}
          onChange={checked => onChange(name, checked)}
        />
      );
    case 'picklist':
      return (
        <RadioGroup
          labels={{ label }}
          onChange={e => onChange(name, e.target.value)}
        >
          {options.map(option => (
            <Radio
              key={option}
              value={option}
              labels={{ label: option }}
              checked={settings[name] === option}
              variant="base"
            />
          ))}
        </RadioGroup>
      );
    default:
      return (
        <Input
          label={label}
          value={settings[name]}
          onChange={e => onChange(name, e.target.value)}
        />
      );
  }
}

function applyChanges(state, action) {
  return { ...state, ...action };
}

export default DesignAttributesEditor;
