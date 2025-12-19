import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
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

  // Check if user is admin
  const checkAdminStatus = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin_email', { check_email: email });
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      return data === true;
    } catch {
      return false;
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.expires_at) {
        setSessionExpiresAt(new Date(existingSession.expires_at * 1000));
      }
      
      if (existingSession?.user?.email) {
        checkAdminStatus(existingSession.user.email).then(setIsAdmin);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  // Session expiry warning
  useEffect(() => {
    if (!sessionExpiresAt) return;
    
    const checkExpiry = () => {
      const now = new Date();
      const timeUntilExpiry = sessionExpiresAt.getTime() - now.getTime();
      
      // If session expired, sign out
      if (timeUntilExpiry <= 0) {
        supabase.auth.signOut();
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

      // Check if email is in allowed admin list
      const isAllowed = await checkAdminStatus(email);
      if (!isAllowed) {
        return { 
          success: false, 
          error: 'This email is not authorized to access the admin panel.' 
        };
      }

      const redirectUrl = `${window.location.origin}/admin`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          return { success: false, error: 'Too many requests. Please wait before trying again.' };
        }
        return { success: false, error: error.message };
      }

      // Reset rate limit on success
      resetRateLimit();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, [checkAdminStatus]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
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
