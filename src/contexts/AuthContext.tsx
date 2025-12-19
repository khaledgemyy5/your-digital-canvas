import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, tokenManager } from '@/services/api/auth';
import type { AdminUser } from '@/types';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = tokenManager.getToken();
      if (token && !tokenManager.isExpired()) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            tokenManager.clearToken();
          }
        } catch {
          tokenManager.clearToken();
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        tokenManager.setToken(response.data.token, response.data.expiresAt);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenManager.clearToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
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
