/**
 * Auth API Service
 * Mock implementation for development - replace with real API later
 */

import type { AdminUser, ApiResponse } from '@/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: AdminUser;
  token: string;
  expiresAt: string;
}

// Mock admin user for development
const MOCK_ADMIN: AdminUser = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  // Login - mock implementation
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    await delay(500); // Simulate network delay
    
    // For development, accept any email/password
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    return {
      success: true,
      data: {
        user: { ...MOCK_ADMIN, email: credentials.email },
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt,
      },
      error: null,
    };
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    await delay(200);
    return { success: true, data: undefined, error: null };
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<AdminUser>> => {
    await delay(200);
    const token = tokenManager.getToken();
    if (token && !tokenManager.isExpired()) {
      return { success: true, data: MOCK_ADMIN, error: null };
    }
    return { success: false, data: null, error: 'Not authenticated' };
  },
};

// Token management
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

export default authApi;
