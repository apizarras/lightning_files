import React, { useState, useEffect } from 'react';
import Connect, { useConnection } from './Connect';
import './index.css';

export * from './Connect';

const ConnectionProvider = props => {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!sessionExpired) return;
    window.alert('Session Expired');
    window.location.reload();
  }, [sessionExpired]);

  return (
    <React.StrictMode>
      <Connect onSessionExpired={() => setSessionExpired(true)}>
        <FxMenu />
        <div id="dev-main">{props.children}</div>
      </Connect>
    </React.StrictMode>
  );
};

const FxMenu = props => {
  const connection = useConnection();
  const { display_name, organization_name } = connection.identity;

  return (
    <div id="dev-menu">
      <svg id="fx-logo" viewBox="-4.5 -5 42 42">
        <path d="M9.625 17.125v4.75h-2.375v-11.813h0.003v-0.003l9.442-0.002 3.079 3.941 4.357-5.997 2.941-0.008-5.777 7.952 4.535 5.804-3.020-0.008-2.967-3.797-5.988 8.242-2.934-0.003 7.401-10.186-2.784-3.563h-5.913v2.316h4.697l0.928 1.188-0.928 1.187h-4.697z" />
      </svg>
      {display_name} - {organization_name}
      <a href="#logout" onClick={connection.logout}>
        Logout
      </a>
    </div>
  );
};

export default ConnectionProvider;
