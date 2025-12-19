/**
 * Publish API Service - Provider Agnostic
 * Uses REST API endpoints via edge functions
 */

import type { ApiResponse } from '@/types';

// Get the API base URL
const getApiBaseUrl = (): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is not configured');
  }
  return `${supabaseUrl}/functions/v1`;
};

// Get auth token
const getAuthToken = (): string | null => {
  const keys = ['sb-ixodttaayenelpdratzb-auth-token', 'auth_token'];
  for (const key of keys) {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.access_token || stored;
      } catch {
        return stored;
      }
    }
  }
  return null;
};

// Fetch wrapper with auth
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Request failed', success: false };
    }

    return { data: json.data ?? json, error: null, success: true };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Network error', success: false };
  }
}

interface PublishStatus {
  draftsCount: number;
  publishedCount: number;
  lastPublishedAt: string | null;
}

interface PublishResult {
  publishedItems: string[];
  failedItems: string[];
  timestamp: string;
}

interface DraftItem {
  id: string;
  type: 'section' | 'project' | 'settings';
  title: string;
  lastModified: string;
}

export const publishApi = {
  /**
   * Publish a single section
   */
  publishSection: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/api-publish/section/${id}`, {
      method: 'POST',
    });
  },

  /**
   * Publish a single project
   */
  publishProject: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/api-publish/project/${id}`, {
      method: 'POST',
    });
  },

  /**
   * Publish all settings (site, theme, social, resume)
   */
  publishSettings: async (): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-publish/settings', {
      method: 'POST',
    });
  },

  /**
   * Publish everything (all sections, projects, and settings)
   */
  publishAll: async (): Promise<ApiResponse<PublishResult>> => {
    const result = await fetchWithAuth<{ message: string }>('/api-publish/all', {
      method: 'POST',
    });
    
    if (result.success) {
      return {
        data: {
          publishedItems: [],
          failedItems: [],
          timestamp: new Date().toISOString(),
        },
        error: null,
        success: true,
      };
    }
    
    return { data: null, error: result.error, success: false };
  },

  /**
   * Publish specific items (for compatibility)
   */
  publishItems: async (itemIds: string[]): Promise<ApiResponse<PublishResult>> => {
    // For now, just publish all
    return publishApi.publishAll();
  },

  /**
   * Discard all drafts (placeholder)
   */
  discardAll: async (): Promise<ApiResponse<void>> => {
    // This would need a dedicated endpoint
    return { data: undefined, error: null, success: true };
  },

  // Get status (placeholder)
  getStatus: async (): Promise<ApiResponse<PublishStatus>> => {
    return {
      data: {
        draftsCount: 0,
        publishedCount: 0,
        lastPublishedAt: null,
      },
      error: null,
      success: true,
    };
  },

  // Get pending drafts (placeholder)
  getPendingDrafts: async (): Promise<ApiResponse<DraftItem[]>> => {
    return { data: [], error: null, success: true };
  },
};

export default publishApi;
