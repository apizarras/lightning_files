import { useEffect, useRef } from 'react';

const listeners = {};

function addEventListener(name, handler) {
  listeners[name] = listeners[name] || [];
  listeners[name].push(handler);
}

function removeEventListener(name, handler) {
  listeners[name] = (listeners[name] || []).filter(x => x !== handler);
}

export function handleAppEvent({ type, payload }) {
  (listeners[type] || []).forEach(handler => handler(payload));
}

export function useAppEventListener(name, handler) {
  const listener = useRef();

  useEffect(() => (listener.current = handler), [handler]);

  useEffect(() => {
    const eventListener = event => listener.current(event);
    addEventListener(name, eventListener);
    return () => removeEventListener(name, eventListener);
  }, [name]);
}
