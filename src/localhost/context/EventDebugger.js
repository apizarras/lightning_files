import React, { useReducer } from 'react';
import { Card, RadioGroup, Radio, Textarea, Button } from '@salesforce/design-system-react';
import { triggerMessageHandler } from '../../ItemPicker/api/events';
import { MESSAGE_TYPES } from '../../constants';

function reducer(state, action) {
  return { ...state, ...action };
}

const EventDebugger = props => {
  const [params, dispatch] = useReducer(reducer, {});

  function triggerEvent() {
    const { name, value } = params;
    if (!name) return;

    try {
      const message = { name, value: value && JSON.parse(value) };
      console.info('SIMULATED INCOMING MESSAGE', message);
      triggerMessageHandler(message);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Card heading="Application Events">
      <div className="slds-card__body slds-card__body--inner slds-form slds-form_stacked slds-clearfix">
        <RadioGroup labels={{ label: 'Name' }} onChange={e => dispatch({ name: e.target.value })}>
          {MESSAGE_TYPES.map(name => (
            <Radio
              key={name}
              value={name}
              labels={{ label: name }}
              checked={params.name === name}
              variant="base"
            />
          ))}
        </RadioGroup>
        <Textarea
          label="Value"
          value={params.value}
          onChange={e => dispatch({ value: e.target.value })}
        />

        <div className="slds-m-top_medium">
          <Button
            className="slds-float_right"
            variant="brand"
            label="Simulate Incoming Event"
            onClick={triggerEvent}
          />
        </div>
      </div>
    </Card>
  );
};

export default EventDebugger;
