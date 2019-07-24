import { useState, useEffect, useRef } from 'react';

export function useWhyDidYouUpdate(name, props) {
  // Get a mutable ref object where we can store props ...
  // ... for comparison next time this hook runs.
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      // Get all keys from previous and current props
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      // Use this object to keep track of changed props
      const changesObj = {};
      // Iterate through keys
      allKeys.forEach(key => {
        // If previous is different from current
        if (previousProps.current[key] !== props[key]) {
          // Add to changesObj
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });

      // If changesObj not empty then output to console
      if (Object.keys(changesObj).length) {
        console.log('[why-did-you-update]', name, changesObj);
      }
    }

    // Finally update previousProps with current props for next hook call
    previousProps.current = props;
  });
}

export function useLogger([state, dispatch]) {
  const actionRef = useRef();

  const newDispatchRef = useRef(action => {
    actionRef.current = action;
    dispatch(action);
  });

  useEffect(() => {
    const action = actionRef.current;

    if (action) {
      console.group('Dispatch');
      console.log('Action:', action);
      console.log('State:', state);
      console.groupEnd();
    }
  }, [state]);

  return [state, newDispatchRef.current];
}

export function useThunk([state, dispatch]) {
  const stateRef = useRef();
  stateRef.current = state;

  const getStateRef = useRef(() => stateRef.current);

  const newDispatchRef = useRef(action => {
    if (typeof action === 'function') {
      action(newDispatchRef.current, getStateRef.current);
    } else {
      dispatch(action);
    }
  });

  return [state, newDispatchRef.current];
}

export function useDebounce(value, delay) {
  const [debouncing, setDebouncing] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    setDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setDebouncing(false);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return [debouncedValue, debouncing];
}
