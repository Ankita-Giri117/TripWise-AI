import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getCurrentUserApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tripwise_token') || null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('tripwise_token');
    setToken(null);
    setUser(null);
  };

  // Load user profile if token is present
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await getCurrentUserApi();
          setUser(userData);
        } catch (err) {
          console.error('Failed to load authenticated user profile:', err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      localStorage.setItem('tripwise_token', data.token);
      setToken(data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await registerApi(name, email, password);
      localStorage.setItem('tripwise_token', data.token);
      setToken(data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
