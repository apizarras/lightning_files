import { useEffect, useRef } from 'react';

const listeners = {};

function addMessageListener(name, handler) {
  listeners[name] = listeners[name] || [];
  listeners[name].push(handler);
}

function removeMessageListener(name, handler) {
  listeners[name] = (listeners[name] || []).filter(x => x !== handler);
}

export function triggerMessageHandler(message) {
  const { name, value } = message;
  if (!name) return;
  (listeners[name] || []).forEach(handler => handler(value));
}

export function useMessageListener(name, handler) {
  const listener = useRef();

  useEffect(() => (listener.current = handler), [handler]);

  useEffect(() => {
    const eventListener = event => listener.current(event);
    addMessageListener(name, eventListener);
    return () => removeMessageListener(name, eventListener);
  }, [name]);
}

export function createEventService(eventHost) {
  if (!eventHost) return;

  eventHost.addMessageHandler(message => {
    console.log('message received by react', message);
    triggerMessageHandler(message);
  });

  return {
    sendMessage: eventHost.sendMessage,
    addMessageHandler: (name, handler) => {
      listeners[name] = listeners[name] || [];
      listeners[name].push(handler);
    }
  };
}
