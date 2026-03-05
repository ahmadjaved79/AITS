import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ahis_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('ahis_token') || null);

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('ahis_user', JSON.stringify(userData));
    localStorage.setItem('ahis_token', jwt);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('ahis_user');
    localStorage.removeItem('ahis_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
