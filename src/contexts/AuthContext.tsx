/**
 * Auth Context - Provider Agnostic
 * 
 * This context uses the auth API service for all authentication operations.
 * No direct SDK/database calls - all communication goes through the API layer.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '@/services/api/auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sessionExpiresAt: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiting configuration
const RATE_LIMIT_KEY = 'admin_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface RateLimitData {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const getRateLimitData = (): RateLimitData => {
  try {
    const data = localStorage.getItem(RATE_LIMIT_KEY);
    return data ? JSON.parse(data) : { attempts: 0, firstAttempt: Date.now() };
  } catch {
    return { attempts: 0, firstAttempt: Date.now() };
  }
};

const setRateLimitData = (data: RateLimitData) => {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
};

const checkRateLimit = (): { allowed: boolean; remainingTime?: number } => {
  const data = getRateLimitData();
  
  // Check if currently locked out
  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    return { allowed: false, remainingTime: data.lockedUntil - Date.now() };
  }
  
  // Reset if lockout expired or window expired
  if (data.lockedUntil && Date.now() >= data.lockedUntil) {
    setRateLimitData({ attempts: 0, firstAttempt: Date.now() });
    return { allowed: true };
  }
  
  return { allowed: data.attempts < MAX_ATTEMPTS };
};

const recordAttempt = () => {
  const data = getRateLimitData();
  const newAttempts = data.attempts + 1;
  
  if (newAttempts >= MAX_ATTEMPTS) {
    setRateLimitData({
      ...data,
      attempts: newAttempts,
      lockedUntil: Date.now() + LOCKOUT_DURATION,
    });
  } else {
    setRateLimitData({
      ...data,
      attempts: newAttempts,
    });
  }
};

const resetRateLimit = () => {
  localStorage.removeItem(RATE_LIMIT_KEY);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);

  // Check if user is admin via API
  const checkAdminStatus = useCallback(async (email: string): Promise<boolean> => {
    const result = await authApi.checkAdminEmail(email);
    return result.success && result.data === true;
  }, []);

  // Set up auth state listener via API
  useEffect(() => {
    // Set up listener FIRST
    const unsubscribe = authApi.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.expires_at) {
        setSessionExpiresAt(new Date(currentSession.expires_at * 1000));
      } else {
        setSessionExpiresAt(null);
      }
      
      // Check admin status with setTimeout to avoid deadlock
      if (currentSession?.user?.email) {
        setTimeout(() => {
          checkAdminStatus(currentSession.user.email!).then(setIsAdmin);
        }, 0);
      } else {
        setIsAdmin(false);
      }
      
      // Reset rate limit on successful login
      if (event === 'SIGNED_IN') {
        resetRateLimit();
      }
    });

    // THEN check for existing session via API
    authApi.getSession().then((result) => {
      if (result.success && result.data) {
        setSession(result.data.session);
        setUser(result.data.user);
        
        if (result.data.expiresAt) {
          setSessionExpiresAt(result.data.expiresAt);
        }
        
        if (result.data.user?.email) {
          checkAdminStatus(result.data.user.email).then(setIsAdmin);
        }
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, [checkAdminStatus]);

  // Session expiry handling via API
  useEffect(() => {
    if (!sessionExpiresAt) return;
    
    const checkExpiry = () => {
      const now = new Date();
      const timeUntilExpiry = sessionExpiresAt.getTime() - now.getTime();
      
      // If session expired, sign out via API
      if (timeUntilExpiry <= 0) {
        authApi.logout();
      }
    };
    
    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  const sendMagicLink = useCallback(async (email: string) => {
    // Check rate limit
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const minutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000);
      return { 
        success: false, 
        error: `Too many login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` 
      };
    }

    try {
      // Record attempt before checking admin status
      recordAttempt();

      // Check if email is in allowed admin list via API
      const isAllowed = await checkAdminStatus(email);
      if (!isAllowed) {
        return { 
          success: false, 
          error: 'This email is not authorized to access the admin panel.' 
        };
      }

      const redirectUrl = `${window.location.origin}/admin`;
      
      // Send magic link via API
      const result = await authApi.sendMagicLink(email, redirectUrl);

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to send magic link' };
      }

      // Reset rate limit on success
      resetRateLimit();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, [checkAdminStatus]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    // Check rate limit
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const minutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000);
      return { 
        success: false, 
        error: `Too many login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` 
      };
    }

    try {
      recordAttempt();

      // Check if email is in allowed admin list
      const isAllowed = await checkAdminStatus(email);
      if (!isAllowed) {
        return { 
          success: false, 
          error: 'This email is not authorized to access the admin panel.' 
        };
      }

      const result = await authApi.signInWithPassword(email, password);

      if (!result.success) {
        return { success: false, error: result.error || 'Invalid email or password' };
      }

      resetRateLimit();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, [checkAdminStatus]);

  const signUp = useCallback(async (email: string, password: string) => {
    // Check rate limit
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const minutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000);
      return { 
        success: false, 
        error: `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` 
      };
    }

    try {
      recordAttempt();

      // Check if email is in allowed admin list
      const isAllowed = await checkAdminStatus(email);
      if (!isAllowed) {
        return { 
          success: false, 
          error: 'This email is not authorized to access the admin panel.' 
        };
      }

      const redirectUrl = `${window.location.origin}/admin`;
      const result = await authApi.signUp(email, password, redirectUrl);

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to create account' };
      }

      resetRateLimit();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, [checkAdminStatus]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setSessionExpiresAt(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
        sendMagicLink,
        signInWithPassword,
        signUp,
        logout,
        sessionExpiresAt,
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
