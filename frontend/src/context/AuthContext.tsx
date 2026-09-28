import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole } from '../types';
import { apiLogin, apiRegister, apiGetCurrentUser } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    avatar?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('flowdesk_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('flowdesk_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Validate and sync current user on load
  const verifySession = useCallback(async () => {
    const storedToken = localStorage.getItem('flowdesk_token');
    if (!storedToken) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const user = await apiGetCurrentUser();
      setCurrentUser(user);
      localStorage.setItem('flowdesk_user', JSON.stringify(user));
    } catch {
      // Invalid/expired token
      localStorage.removeItem('flowdesk_token');
      localStorage.removeItem('flowdesk_user');
      setToken(null);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiLogin(email, password);
      setToken(res.token);
      setCurrentUser(res.user);
      localStorage.setItem('flowdesk_token', res.token);
      localStorage.setItem('flowdesk_user', JSON.stringify(res.user));
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    avatar?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRegister(data);
      setToken(res.token);
      setCurrentUser(res.user);
      localStorage.setItem('flowdesk_token', res.token);
      localStorage.setItem('flowdesk_user', JSON.stringify(res.user));
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('flowdesk_token');
    localStorage.removeItem('flowdesk_user');
    setToken(null);
    setCurrentUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
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
