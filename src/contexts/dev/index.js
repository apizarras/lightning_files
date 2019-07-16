import React, { useState, useEffect } from 'react';
import Connect from './Connect';
import Menu from './Menu';

export * from './Connect';

export const ConnectionProvider = props => {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!sessionExpired) return;
    window.alert('Your Salesforce session has expired');
    window.location.reload();
  }, [sessionExpired]);

  return (
    <React.StrictMode>
      <Connect onSessionExpired={() => setSessionExpired(true)}>
        <Menu />
        {props.children}
      </Connect>
    </React.StrictMode>
  );
};
