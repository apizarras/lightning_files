import React, { useState, useEffect } from 'react';
import Connect from './Connect';
import Menu from './Menu';
import { SettingsProvider } from './Settings';
import DesignAttributesEditor from './DesignAttributesEditor';

export * from './Connect';
export * from './Settings';

export const ConnectionProvider = ({ children }) => {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!sessionExpired) return;
    window.alert('Your Salesforce session has expired');
    window.location.reload();
  }, [sessionExpired]);

  return (
    <Connect onSessionExpired={() => setSessionExpired(true)}>
      <SettingsProvider>
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}>
        <Menu />
          <div className="slds-brand-band slds-brand-band_medium">
            <section
              style={{
                position: 'absolute',
                top: 50,
                width: '100%',
                height: 'calc(100% - 50px)',
              }}>
              <div className="slds-template_default">
                <div
                  style={{
                    display: 'flex',
                    flexFlow: 'row wrap',
                    minWidth: 1050,
                    marginBottom: '3rem',
                  }}>
                  <div style={{ width: '66.66%' }}>{children}</div>
                  <div style={{ width: '33.33%', paddingLeft: '.75rem' }}>
                    <DesignAttributesEditor />

                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </SettingsProvider>
    </Connect>
  );
};
