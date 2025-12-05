'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { BulkSenderApiResponse } from '@/types';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/bulk-sender/auth', {
        method: 'GET',
        credentials: 'include',
      });

      const data: BulkSenderApiResponse<{ authenticated: boolean }> = await response.json();

      if (data.success && data.data) {
        setIsAuthenticated(data.data.authenticated);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/bulk-sender/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data: BulkSenderApiResponse<{ authenticated: boolean }> = await response.json();

      if (data.success && data.data?.authenticated) {
        setIsAuthenticated(true);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Invalid password',
      };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/bulk-sender/auth', {
        method: 'DELETE',
        credentials: 'include',
      });

      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
