// Authentication & RBAC Context - Enterprise Specification
// Manages authentication token, user identity, session state, 2-Step MFA completion,
// secure logout, Tab-Scoped Session (sessionStorage), and 15-Minute Inactivity Auto-Logout

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { userApi } from '../api/user.api';

const AuthContext = createContext(null);

// Inactivity timeout: 15 minutes (NIST SP 800-63B enterprise standard)
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  // Read session strictly from sessionStorage so that closing the tab/window automatically terminates session
  const [user, setUser] = useState(() => {
    try {
      // Clean up any legacy localStorage from older versions
      if (typeof window !== 'undefined') {
        localStorage.removeItem('riskradar_user');
        localStorage.removeItem('riskradar_token');
      }
      const saved = typeof window !== 'undefined' ? sessionStorage.getItem('riskradar_user') : null;
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return typeof window !== 'undefined' ? sessionStorage.getItem('riskradar_token') || null : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());

  // Logout function (cleans session and optionally redirects with reason)
  const logout = useCallback(async (redirectReason = null) => {
    try {
      const currentToken = typeof window !== 'undefined' ? sessionStorage.getItem('riskradar_token') : null;
      if (currentToken) {
        await authApi.logout().catch(() => {});
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('riskradar_token');
          sessionStorage.removeItem('riskradar_user');
          localStorage.removeItem('riskradar_token');
          localStorage.removeItem('riskradar_user');
        }
      } catch {}

      if (redirectReason && typeof window !== 'undefined') {
        window.location.href = `/login?reason=${redirectReason}`;
      }
    }
  }, []);

  // Sync session with backend on initial load
  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await userApi.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            sessionStorage.setItem('riskradar_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token, logout]);

  // Enterprise Inactivity / Idle Timeout Auto-Logout (15 minutes)
  useEffect(() => {
    if (!token) return;

    // Reset activity timestamp on mount
    lastActivityRef.current = Date.now();

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const userEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    userEvents.forEach((evt) => {
      window.addEventListener(evt, recordActivity, { passive: true });
    });

    // Check inactivity every 5 seconds
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        console.warn('RiskRadar Security: 15-minute inactivity threshold reached. Auto-logging out.');
        logout('idle_timeout');
      }
    }, 5000);

    // Also trigger on tab visibility change (e.g. returning to tab after laptop was locked or in background)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= IDLE_TIMEOUT_MS) {
          logout('idle_timeout');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      userEvents.forEach((evt) => {
        window.removeEventListener(evt, recordActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, logout]);

  // Step 1 of Login: Validates credentials and triggers 2-Step MFA
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.token && !res.mfaRequired) {
      setToken(res.token);
      setUser(res.user);
      sessionStorage.setItem('riskradar_token', res.token);
      sessionStorage.setItem('riskradar_user', JSON.stringify(res.user));
      lastActivityRef.current = Date.now();
    }
    return res;
  };

  // Step 2 of Login: Called after 6-digit MFA challenge succeeds
  const completeMfaLogin = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    sessionStorage.setItem('riskradar_token', jwtToken);
    sessionStorage.setItem('riskradar_user', JSON.stringify(userData));
    lastActivityRef.current = Date.now();
  };

  // Enterprise Registration (Requires Admin approval)
  const register = async (userData) => {
    const res = await authApi.register(userData);
    return res;
  };

  const refreshProfile = async () => {
    const res = await userApi.getProfile();
    if (res.success) {
      setUser(res.user);
      sessionStorage.setItem('riskradar_user', JSON.stringify(res.user));
    }
  };

  const extendSession = async () => {
    lastActivityRef.current = Date.now();
    try {
      await userApi.extendSession();
    } catch {
      // Local timer was refreshed even if offline
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        role: user?.role || null,
        idleTimeoutMinutes: 15,
        login,
        completeMfaLogin,
        register,
        logout,
        refreshProfile,
        extendSession,
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
