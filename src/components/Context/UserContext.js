import React, { createContext, useMemo } from 'react';
import { useUser } from '../hooks';

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, loading, error] = useUser();
  const value = useMemo(
    () => ({
      user,
      loading,
      error
    }),
    [user, loading, error]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
