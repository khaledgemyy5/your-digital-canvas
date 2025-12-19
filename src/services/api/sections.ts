/**
 * Sections API Service - Provider Agnostic
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
  // Try multiple storage locations
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

// Section types
export interface Section {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content_draft: Record<string, unknown>;
  content_published: Record<string, unknown> | null;
  is_visible: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  bullets?: SectionBullet[];
}

export interface SectionBullet {
  id: string;
  section_id: string;
  content_draft: string | null;
  content_published: string | null;
  display_order: number;
  is_published: boolean;
  deleted_at: string | null;
}

export const sectionsApi = {
  /**
   * Get all sections
   */
  list: async (): Promise<ApiResponse<Section[]>> => {
    return fetchWithAuth<Section[]>('/api-sections');
  },

  // Alias for compatibility
  getAll: async (): Promise<ApiResponse<Section[]>> => {
    return sectionsApi.list();
  },

  // Get published sections only
  getPublished: async (): Promise<ApiResponse<Section[]>> => {
    const result = await sectionsApi.list();
    if (result.success && result.data) {
      result.data = result.data.filter(s => s.is_published && s.is_visible);
    }
    return result;
  },

  /**
   * Get a single section by ID
   */
  getById: async (id: string): Promise<ApiResponse<Section>> => {
    return fetchWithAuth<Section>(`/api-sections/${id}`);
  },

  /**
   * Create a new section
   */
  create: async (section: Partial<Section>): Promise<ApiResponse<Section>> => {
    return fetchWithAuth<Section>('/api-sections', {
      method: 'POST',
      body: JSON.stringify(section),
    });
  },

  /**
   * Update a section
   */
  update: async (id: string, section: Partial<Section>): Promise<ApiResponse<Section>> => {
    return fetchWithAuth<Section>(`/api-sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(section),
    });
  },

  /**
   * Delete a section (soft delete)
   */
  delete: async (id: string): Promise<ApiResponse<Section>> => {
    return fetchWithAuth<Section>(`/api-sections/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Reorder sections
   */
  reorder: async (items: { id: string; display_order: number }[]): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-sections/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  },

  /**
   * Publish a section
   */
  publish: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/api-publish/section/${id}`, {
      method: 'POST',
    });
  },

  /**
   * Toggle visibility
   */
  toggleVisibility: async (id: string): Promise<ApiResponse<Section>> => {
    const result = await sectionsApi.getById(id);
    if (!result.success || !result.data) return result as ApiResponse<Section>;
    
    return sectionsApi.update(id, { is_visible: !result.data.is_visible });
  },

  /**
   * Discard draft (revert to published)
   */
  discardDraft: async (id: string): Promise<ApiResponse<Section>> => {
    const result = await sectionsApi.getById(id);
    if (!result.success || !result.data) return result as ApiResponse<Section>;
    
    return sectionsApi.update(id, { content_draft: result.data.content_published || {} });
  },
};

export default sectionsApi;
