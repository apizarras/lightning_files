import React, { useReducer } from 'react';
import { useSettings, getDefaultSettings } from './Settings';
import { DESIGN_ATTRIBUTES } from '../../constants';
import {
  Card,
  Input,
  Textarea,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
} from '@salesforce/design-system-react';

function applyChanges(state, action) {
  return { ...state, ...action };
}

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
    <Card heading="Design Attributes">
      <div className="slds-card__body slds-card__body--inner slds-form slds-form_stacked">
        <div className="slds-m-top_medium">
          <Button variant="base" label="Reset to defaults" onClick={reset} />
          <Button
            className="slds-float_right"
            variant="brand"
            label="Update Settings"
            onClick={save}
          />
        </div>
        {DESIGN_ATTRIBUTES.map(config => (
          <Editor key={config.name} config={config} settings={changes} onChange={onChange} />
        ))}
      </div>
    </Card>
  );
};

// https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_attribute.htm
const Editor = ({ config, settings, onChange }) => {
  const { name, label, type, options } = config;

  switch (type) {
    case 'boolean':
      return (
        <Checkbox
          labels={{ label }}
          checked={settings[name]}
          onChange={checked => onChange(name, checked)}
        />
      );
    case 'picklist':
      return (
        <RadioGroup labels={{ label }} onChange={e => onChange(name, e.target.value)}>
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
    case 'number':
      return (
        <Input
          type="number"
          label={label}
          value={settings[name]}
          onChange={e => onChange(name, e.target.value)}
        />
      );
    case 'string':
    default:
      return (
        <Textarea
          label={label}
          value={settings[name]}
          onChange={e => onChange(name, e.target.value)}
        />
      );
  }
};

export default DesignAttributesEditor;
