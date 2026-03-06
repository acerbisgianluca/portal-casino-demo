'use client';

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
    isAuthenticated: boolean;
    isLoading: boolean;
    sessionToken: string | null;
    setSessionToken: (token: string) => void;
    clearSessionToken: () => void;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionTokenState] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (token) {
      setSessionTokenState(token)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const setSessionToken = (token: string) => {
    setSessionTokenState(token);
    setIsAuthenticated(true);
  };

  const clearSessionToken = () => {
    setSessionTokenState(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, sessionToken, setSessionToken, clearSessionToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
