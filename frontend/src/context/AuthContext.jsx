// Authentication & RBAC Context
// Manages authentication token, user identity, session state, and login/logout workflows

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { userApi } from '../api/user.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('riskradar_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('riskradar_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync session with backend on initial load
  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await userApi.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('riskradar_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('riskradar_token', res.token);
      localStorage.setItem('riskradar_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('riskradar_token', res.token);
      localStorage.setItem('riskradar_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      if (token) await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('riskradar_token');
      localStorage.removeItem('riskradar_user');
    }
  };

  const refreshProfile = async () => {
    const res = await userApi.getProfile();
    if (res.success) {
      setUser(res.user);
      localStorage.setItem('riskradar_user', JSON.stringify(res.user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        role: user?.role || null,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
