import React from 'react';
import { Card, Button } from '@salesforce/design-system-react';
import { lightningEventsCallback } from './apiMethods';

const EventsTester = () => {
  const doRefresh = e => {
    e.stopPropagation();
    let transport = { mode: 'refreshView', data: {} };
    lightningEventsCallback(transport);
  };

  return (
    <Card heading="External Events">
      <div className="slds-card__body slds-card__body--inner slds-form slds-form_stacked">
        <Button onClick={doRefresh}>Refresh</Button>
      </div>
    </Card>
  );
};

export default EventsTester;
