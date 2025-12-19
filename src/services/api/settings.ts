/**
 * Settings API Service - Provider Agnostic
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

// Types
export interface SiteSettingsData {
  [key: string]: {
    draft: unknown;
    published: unknown;
    is_published: boolean;
  };
}

export interface ThemeSettingsData {
  [key: string]: {
    draft: unknown;
    published: unknown;
    is_published: boolean;
  };
}

export interface SocialLink {
  id: string;
  platform: string;
  url_draft: string | null;
  url_published: string | null;
  icon: string | null;
  is_visible: boolean;
  is_published: boolean;
  display_order: number;
}

export interface ResumeAsset {
  id: string;
  filename: string | null;
  file_url_draft: string | null;
  file_url_published: string | null;
  external_url_draft: string | null;
  external_url_published: string | null;
  is_active: boolean;
  is_published: boolean;
}

export const settingsApi = {
  // Site Settings
  getSiteSettings: async (): Promise<ApiResponse<SiteSettingsData>> => {
    return fetchWithAuth<SiteSettingsData>('/api-settings/site');
  },

  updateSiteSettings: async (settings: Record<string, unknown>): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-settings/site', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Theme Settings
  getThemeSettings: async (): Promise<ApiResponse<ThemeSettingsData>> => {
    return fetchWithAuth<ThemeSettingsData>('/api-settings/theme');
  },

  updateThemeSettings: async (settings: Record<string, unknown>): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-settings/theme', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Social Links
  getSocialLinks: async (): Promise<ApiResponse<SocialLink[]>> => {
    return fetchWithAuth<SocialLink[]>('/api-settings/social');
  },

  createSocialLink: async (link: Partial<SocialLink>): Promise<ApiResponse<SocialLink>> => {
    return fetchWithAuth<SocialLink>('/api-settings/social', {
      method: 'POST',
      body: JSON.stringify(link),
    });
  },

  updateSocialLink: async (id: string, link: Partial<SocialLink>): Promise<ApiResponse<SocialLink>> => {
    return fetchWithAuth<SocialLink>(`/api-settings/social/${id}`, {
      method: 'PUT',
      body: JSON.stringify(link),
    });
  },

  deleteSocialLink: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/api-settings/social/${id}`, {
      method: 'DELETE',
    });
  },

  // Resume
  getResume: async (): Promise<ApiResponse<ResumeAsset | null>> => {
    return fetchWithAuth<ResumeAsset | null>('/api-settings/resume');
  },

  updateResume: async (resume: Partial<ResumeAsset>): Promise<ApiResponse<ResumeAsset>> => {
    return fetchWithAuth<ResumeAsset>('/api-settings/resume', {
      method: 'PUT',
      body: JSON.stringify(resume),
    });
  },
};

export default settingsApi;
