import { useEffect, useRef } from 'react';

export default function useDOMEventListener(
  eventName,
  handler,
  target = document
) {
  const listener = useRef();

  useEffect(() => (listener.current = handler), [handler]);

  useEffect(() => {
    if (!target || !target.addEventListener) return;

    const eventListener = event => listener.current(event);
    target.addEventListener(eventName, eventListener);
    return () => target.removeEventListener(eventName, eventListener);
  }, [eventName, target]);
}
