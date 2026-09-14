import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AuthProvider = ({ children }) => {
  // Restore auth state from sessionStorage on app load
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!sessionStorage.getItem('auth-token');
  });
  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem('name') || '';
  });

  return (
    <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn, userName, setUserName }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
