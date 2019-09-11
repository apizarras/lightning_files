import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useDOMEventListener from './useDOMEventListener';
import { Connection } from 'jsforce';

const SESSION_URL = 'https://login.fieldfx.com/session';
const LOGIN_URL = 'https://login.fieldfx.com/login';
const LOGOUT_URL = 'https://login.fieldfx.com/oauth/logout';
const PROXY_URL = 'https://login.fieldfx.com/salesforce';

const ConnectionContext = createContext();

/** React hook to access jsforce connection in function components */
export const useConnection = () => useContext(ConnectionContext);

/** Component that provides context access to jsforce connection */
export default function Connect({ onSessionExpired, children }) {
  const [connection, setConnection] = useState();
  const checkSession = useCallback(
    () => connection && getJSON(connection, 'limits', onSessionExpired),
    [connection, onSessionExpired]
  );

  useDOMEventListener('visibilitychange', checkSession);

  useEffect(() => {
    async function connect() {
      const connection = await getConnection(onSessionExpired);
      setConnection(connection);
    }

    connect();
  }, [onSessionExpired]);

  useEffect(() => {
    if (!connection) return;

    // remove default spinner in host page (if found)
    const spinner = document.getElementById('fx-spinner');
    spinner && spinner.remove();
  }, [connection]);

  if (!connection) return null;

  return <ConnectionContext.Provider value={connection}>{children}</ConnectionContext.Provider>;
}

/** Retrieve/restore a jsforce connection and possibly redirect to admin portal for re-authentication.
 * @param onSessionExpired - called when an expired session is detected
 * @returns jsforce connection
 */
export function getConnection(onSessionExpired) {
  return fetch(SESSION_URL, { credentials: 'include' })
    .then(response => {
      if (response.ok && !response.redirected) return response.json();
      window.location.href = `${LOGIN_URL}?returnUrl=${encodeURIComponent(window.location.href)}`;
    })
    .then(session => {
      const { oauth, identity = {} } = session || {};
      if (!oauth) return Promise.reject();

      if (window.location.hostname === 'localhost') {
        oauth.proxyUrl = PROXY_URL;
      }

      const logLevel = process.env.NODE_ENV !== 'production' ? 'DEBUG' : 'ERROR';
      const options = { ...oauth, refreshFn: onSessionExpired, logLevel };
      const connection = new Connection(options);
      connection.identity = identity;
      connection.logout = () => (window.location.href = LOGOUT_URL);
      connection.getJSON = resource => getJSON(connection, resource, onSessionExpired);

      return connection;
    });
}

/** Salesforce rest API GET
 * @param connection - jsforce connection
 * @param resource - resource path - /services/data/vXX.X/ portion is optional
 * @returns JSON response
 */
export function getJSON(connection, resource, onSessionTimeout) {
  // auto-prefix resource with /services/data/vXX.X/ if missing
  if (/^\/?services\/data\//.test(resource) === false) {
    const prefix = `/services/data/v${connection.version}/`;
    resource = prefix + resource.replace(/^\//, '');
  }

  const [url, options] = getRequestOptions(connection, resource);

  return fetch(url, options).then(response => {
    if (response.ok) return response.json();

    if (response.status === 401) {
      if (onSessionTimeout) {
        onSessionTimeout();
        return new Promise(() => {});
      } else {
        throw new Error('UNAUTHORIZED');
      }
    }

    // try to log salesforce errors
    return response
      .json()
      .catch(() => {
        console.error('API REQUEST FAILED', { resource, response });
        throw new Error('API REQUEST FAILED');
      })
      .then(errors => {
        console.error('API REQUEST FAILED', { resource, errors });
        return Promise.reject(errors);
      });
  });
}

/** Get params to make AJAX calls to current salesforce instance
 * @param connection - jsforce connection
 * @param path - url path on salesforce instance e.g. /services/data/..
 * @returns [url, options]
 */
export function getRequestOptions(connection, path) {
  const { instanceUrl, accessToken } = connection;
  const escaped = path.replace(/\s/g, '+');
  const options = { headers: { Authorization: `Bearer ${accessToken}` } };
  let url = new URL(escaped, instanceUrl).toString();

  if (window.location.hostname === 'localhost') {
    options.headers['salesforceproxy-endpoint'] = url;
    url = `${PROXY_URL}?${+Date.now()}.${Math.random()}`;
  }

  return [url, options];
}
