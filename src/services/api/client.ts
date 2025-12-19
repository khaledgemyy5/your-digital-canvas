/**
 * API Client - Provider Agnostic
 * 
 * This abstraction layer ensures the frontend communicates ONLY via REST APIs.
 * The implementation can be swapped for any backend (Lovable Cloud, AWS, etc.)
 * without changing the UI code.
 */

import type { ApiResponse } from '@/types';

// Base API URL - can be configured per environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Request options
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// Error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get auth token from storage (abstracted)
function getAuthToken(): string | null {
  // Token storage is abstracted - can be changed based on auth provider
  return localStorage.getItem('auth_token');
}

// Core fetch wrapper
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {}, signal } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.message || data.error || 'An error occurred',
        success: false,
      };
    }

    return {
      data: data as T,
      error: null,
      success: true,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        data: null,
        error: 'Request was cancelled',
        success: false,
      };
    }

    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      success: false,
    };
  }
}

// API Client methods
export const apiClient = {
  get: <T>(endpoint: string, signal?: AbortSignal) =>
    request<T>(endpoint, { method: 'GET', signal }),

  post: <T>(endpoint: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(endpoint, { method: 'POST', body, signal }),

  put: <T>(endpoint: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(endpoint, { method: 'PUT', body, signal }),

  patch: <T>(endpoint: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(endpoint, { method: 'PATCH', body, signal }),

  delete: <T>(endpoint: string, signal?: AbortSignal) =>
    request<T>(endpoint, { method: 'DELETE', signal }),
};

export default apiClient;
