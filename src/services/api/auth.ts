/**
 * Auth API Service
 * All authentication-related API calls go through this service.
 * This is designed to be replaceable with AWS Cognito.
 */

import apiClient from './client';
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

interface RefreshResponse {
  token: string;
  expiresAt: string;
}

export const authApi = {
  // Login
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post<LoginResponse>('/auth/login', credentials),

  // Logout
  logout: (): Promise<ApiResponse<void>> =>
    apiClient.post<void>('/auth/logout'),

  // Get current user
  getCurrentUser: (): Promise<ApiResponse<AdminUser>> =>
    apiClient.get<AdminUser>('/auth/me'),

  // Refresh token
  refreshToken: (): Promise<ApiResponse<RefreshResponse>> =>
    apiClient.post<RefreshResponse>('/auth/refresh'),

  // Request password reset
  requestPasswordReset: (email: string): Promise<ApiResponse<void>> =>
    apiClient.post<void>('/auth/password-reset/request', { email }),

  // Reset password
  resetPassword: (token: string, newPassword: string): Promise<ApiResponse<void>> =>
    apiClient.post<void>('/auth/password-reset/confirm', { token, newPassword }),

  // Validate session
  validateSession: (): Promise<ApiResponse<{ valid: boolean }>> =>
    apiClient.get<{ valid: boolean }>('/auth/validate'),
};

// Token management (abstracted from UI)
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
