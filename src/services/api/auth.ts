/**
 * Auth API Service - Provider Agnostic
 * 
 * This abstraction ensures the frontend communicates via REST-like calls.
 * The implementation uses Supabase internally but can be swapped for any backend.
 */

import type { AdminUser, ApiResponse } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface LoginResponse {
  user: AdminUser;
  token: string;
  expiresAt: string;
}

interface SessionData {
  user: User | null;
  session: Session | null;
  expiresAt: Date | null;
}

type AuthStateCallback = (event: AuthChangeEvent, session: Session | null) => void;

// Token management - abstracted storage
export const tokenManager = {
  setToken: (token: string, expiresAt: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_expires', expiresAt);
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  clearToken: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires');
  },

  isExpired: (): boolean => {
    const expiresAt = localStorage.getItem('auth_expires');
    if (!expiresAt) return true;
    return new Date(expiresAt) <= new Date();
  },
};

// Auth API - all Supabase calls are encapsulated here
export const authApi = {
  /**
   * Get current session
   */
  getSession: async (): Promise<ApiResponse<SessionData>> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return { success: false, data: null, error: error.message };
      }

      return {
        success: true,
        data: {
          user: session?.user ?? null,
          session: session,
          expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null,
        },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get session',
      };
    }
  },

  /**
   * Subscribe to auth state changes
   * Returns an unsubscribe function
   */
  onAuthStateChange: (callback: AuthStateCallback): (() => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return () => subscription.unsubscribe();
  },

  /**
   * Send magic link for authentication
   */
  sendMagicLink: async (email: string, redirectUrl: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          return { success: false, data: null, error: 'Too many requests. Please wait before trying again.' };
        }
        return { success: false, data: null, error: error.message };
      }

      return { success: true, data: undefined, error: null };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to send magic link',
      };
    }
  },

  /**
   * Check if email is authorized as admin
   */
  checkAdminEmail: async (email: string): Promise<ApiResponse<boolean>> => {
    try {
      const { data, error } = await supabase.rpc('is_admin_email', { check_email: email });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return { success: false, data: null, error: error.message };
      }

      return { success: true, data: data === true, error: null };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to check admin status',
      };
    }
  },

  /**
   * Sign out
   */
  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, data: null, error: error.message };
      }

      tokenManager.clearToken();
      return { success: true, data: undefined, error: null };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to logout',
      };
    }
  },

  /**
   * Get current user (mock for development)
   */
  getCurrentUser: async (): Promise<ApiResponse<AdminUser>> => {
    const token = tokenManager.getToken();
    if (token && !tokenManager.isExpired()) {
      const { data } = await authApi.getSession();
      if (data?.user) {
        return {
          success: true,
          data: {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.email?.split('@')[0] || 'Admin',
            role: 'admin',
          },
          error: null,
        };
      }
    }
    return { success: false, data: null, error: 'Not authenticated' };
  },
};

export default authApi;
