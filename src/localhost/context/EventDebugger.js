import React, { useReducer } from 'react';
import {
  Card,
  RadioGroup,
  Radio,
  Textarea,
  Button
} from '@salesforce/design-system-react';
import { handleAppEvent } from '../../api/events';
import { ACTION_TYPES } from '../../constants';

function reducer(state, action) {
  return { ...state, ...action };
}

const EventDebugger = props => {
  const [params, dispatch] = useReducer(reducer, {});

  function triggerEvent() {
    const { type, payload } = params;
    if (!type) return;

    try {
      const action = { type, payload: payload && JSON.parse(payload) };
      console.info('SIMULATED INCOMING EVENT', action);
      handleAppEvent(action);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Card heading="Application Events">
      <div className="slds-card__body slds-card__body--inner slds-form slds-form_stacked slds-clearfix">
        <RadioGroup
          labels={{ label: 'Type' }}
          onChange={e => dispatch({ type: e.target.value })}
        >
          {ACTION_TYPES.map(option => (
            <Radio
              key={option}
              value={option}
              labels={{ label: option }}
              checked={params.type === option}
              variant="base"
            />
          ))}
        </RadioGroup>
        <Textarea
          label="Payload"
          value={params.payload}
          onChange={e => dispatch({ payload: e.target.value })}
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
