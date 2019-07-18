import React, { useState, useEffect } from 'react';
import Connect from './Connect';
import Menu from './Menu';
import { SettingsProvider } from './Settings';

export * from './Connect';
export * from './Settings';

export const ConnectionProvider = props => {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!sessionExpired) return;
    window.alert('Your Salesforce session has expired');
    window.location.reload();
  }, [sessionExpired]);

  return (
    <Connect onSessionExpired={() => setSessionExpired(true)}>
      <SettingsProvider>
        <div style={{ marginTop: 50 }}>
          <Menu />
          <div className="slds-is-relative">{props.children}</div>
        </div>
      </SettingsProvider>
    </Connect>
  );
};
