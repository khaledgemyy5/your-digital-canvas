/**
 * Preview API Service - Provider Agnostic
 * Uses REST API endpoints via edge functions
 */

import type { ApiResponse, SiteSettings } from '@/types';
import type { Section, SectionBullet } from './sections';
import type { Project } from './projects';

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

// Preview data types
export interface PreviewSection extends Section {
  content: Record<string, unknown>;
  bullets: Array<SectionBullet & { content: string | null }>;
}

export interface PreviewProjectPage {
  id: string;
  content: Record<string, unknown> | null;
  is_published: boolean;
}

export interface PreviewProject extends Project {
  title: string;
  description: string | null;
  pages?: PreviewProjectPage[];
}

export interface PreviewSocialLink {
  id: string;
  platform: string;
  url: string | null;
  icon: string | null;
  is_visible: boolean;
  is_published: boolean;
  display_order: number;
}

export interface PreviewResume {
  id: string;
  filename: string | null;
  file_url: string | null;
  external_url: string | null;
  is_active: boolean;
  is_published: boolean;
}

export interface PreviewData {
  sections: PreviewSection[];
  projects: PreviewProject[];
  siteSettings: Record<string, unknown>;
  themeSettings: Record<string, unknown>;
  socialLinks: PreviewSocialLink[];
  resume: PreviewResume | null;
}

interface FullSitePreview {
  sections: Section[];
  projects: Project[];
  settings: SiteSettings;
}

export const previewApi = {
  /**
   * Get full site preview data
   * @param mode 'draft' for admin preview, 'published' for public view
   */
  getSite: async (mode: 'draft' | 'published' = 'draft'): Promise<ApiResponse<PreviewData>> => {
    return fetchWithAuth<PreviewData>(`/api-preview/site?mode=${mode}`);
  },

  /**
   * Get single section preview
   */
  getSection: async (id: string, mode: 'draft' | 'published' = 'draft'): Promise<ApiResponse<PreviewSection>> => {
    return fetchWithAuth<PreviewSection>(`/api-preview/section/${id}?mode=${mode}`);
  },

  /**
   * Get single project preview by ID
   */
  getProject: async (id: string, mode: 'draft' | 'published' = 'draft'): Promise<ApiResponse<PreviewProject>> => {
    return fetchWithAuth<PreviewProject>(`/api-preview/project/${id}?mode=${mode}`);
  },

  /**
   * Get single project preview by slug
   */
  getProjectBySlug: async (slug: string, mode: 'draft' | 'published' = 'draft'): Promise<ApiResponse<PreviewProject>> => {
    return fetchWithAuth<PreviewProject>(`/api-preview/project/slug/${slug}?mode=${mode}`);
  },

  // Compatibility with old API
  getFullSite: async (): Promise<ApiResponse<FullSitePreview>> => {
    const result = await previewApi.getSite('draft');
    if (!result.success || !result.data) {
      return { data: null, error: result.error, success: false };
    }
    
    return {
      data: {
        sections: result.data.sections,
        projects: result.data.projects,
        settings: result.data.siteSettings as unknown as SiteSettings,
      },
      error: null,
      success: true,
    };
  },

  // Generate preview token (placeholder)
  generatePreviewToken: async (expiresInMinutes?: number): Promise<ApiResponse<{ token: string; expiresAt: string }>> => {
    const token = btoa(JSON.stringify({ exp: Date.now() + (expiresInMinutes || 60) * 60 * 1000 }));
    return { 
      data: { token, expiresAt: new Date(Date.now() + (expiresInMinutes || 60) * 60 * 1000).toISOString() },
      error: null,
      success: true,
    };
  },

  // Validate preview token (placeholder)
  validatePreviewToken: async (token: string): Promise<ApiResponse<{ valid: boolean }>> => {
    try {
      const decoded = JSON.parse(atob(token));
      return { data: { valid: decoded.exp > Date.now() }, error: null, success: true };
    } catch {
      return { data: { valid: false }, error: null, success: true };
    }
  },
};

export default previewApi;
