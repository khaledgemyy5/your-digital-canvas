/**
 * Projects API Service - Provider Agnostic
 * Uses REST API endpoints via edge functions
 */

import type { ApiResponse, PaginatedResponse } from '@/types';

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

// Project types
export interface Project {
  id: string;
  slug: string;
  title_draft: string;
  title_published: string | null;
  description_draft: string | null;
  description_published: string | null;
  technologies: string[];
  thumbnail_url: string | null;
  github_url: string | null;
  external_url: string | null;
  is_featured: boolean;
  is_visible: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  project_pages?: ProjectPage[];
}

export interface ProjectPage {
  id: string;
  project_id: string;
  content_draft: Record<string, unknown>;
  content_published: Record<string, unknown> | null;
  is_published: boolean;
}

export const projectsApi = {
  /**
   * Get all projects
   */
  list: async (): Promise<ApiResponse<Project[]>> => {
    return fetchWithAuth<Project[]>('/api-projects');
  },

  // Alias for compatibility
  getAll: async (): Promise<ApiResponse<Project[]>> => {
    return projectsApi.list();
  },

  // Get published projects only
  getPublished: async (): Promise<ApiResponse<Project[]>> => {
    const result = await projectsApi.list();
    if (result.success && result.data) {
      result.data = result.data.filter(p => p.is_published && p.is_visible);
    }
    return result;
  },

  // Get featured projects only
  getFeatured: async (): Promise<ApiResponse<Project[]>> => {
    const result = await projectsApi.list();
    if (result.success && result.data) {
      result.data = result.data.filter(p => p.is_published && p.is_visible && p.is_featured);
    }
    return result;
  },

  // Get paginated (mock for now)
  getPaginated: async (page: number, pageSize: number): Promise<ApiResponse<PaginatedResponse<Project>>> => {
    const result = await projectsApi.list();
    if (!result.success || !result.data) {
      return { data: null, error: result.error, success: false };
    }
    
    const start = (page - 1) * pageSize;
    const data = result.data.slice(start, start + pageSize);
    
    return {
      data: {
        data,
        total: result.data.length,
        page,
        pageSize,
        hasMore: start + pageSize < result.data.length,
      },
      error: null,
      success: true,
    };
  },

  /**
   * Get a single project by ID
   */
  getById: async (id: string): Promise<ApiResponse<Project>> => {
    return fetchWithAuth<Project>(`/api-projects/${id}`);
  },

  /**
   * Get project by slug
   */
  getBySlug: async (slug: string): Promise<ApiResponse<Project>> => {
    const result = await projectsApi.list();
    if (!result.success || !result.data) return { data: null, error: result.error, success: false };
    
    const project = result.data.find(p => p.slug === slug);
    return project 
      ? { data: project, error: null, success: true }
      : { data: null, error: 'Project not found', success: false };
  },

  /**
   * Create a new project
   */
  create: async (project: Partial<Project>): Promise<ApiResponse<Project>> => {
    return fetchWithAuth<Project>('/api-projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  /**
   * Update a project
   */
  update: async (id: string, project: Partial<Project>): Promise<ApiResponse<Project>> => {
    return fetchWithAuth<Project>(`/api-projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },

  /**
   * Delete a project (soft delete)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/api-projects/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Reorder projects
   */
  reorder: async (items: { id: string; display_order: number }[]): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-projects/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  },

  /**
   * Publish a project
   */
  publish: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/api-publish/project/${id}`, {
      method: 'POST',
    });
  },

  /**
   * Toggle visibility
   */
  toggleVisibility: async (id: string): Promise<ApiResponse<Project>> => {
    const result = await projectsApi.getById(id);
    if (!result.success || !result.data) return result as ApiResponse<Project>;
    
    return projectsApi.update(id, { is_visible: !result.data.is_visible });
  },

  /**
   * Toggle featured
   */
  toggleFeatured: async (id: string): Promise<ApiResponse<Project>> => {
    const result = await projectsApi.getById(id);
    if (!result.success || !result.data) return result as ApiResponse<Project>;
    
    return projectsApi.update(id, { is_featured: !result.data.is_featured });
  },

  /**
   * Discard draft
   */
  discardDraft: async (id: string): Promise<ApiResponse<Project>> => {
    const result = await projectsApi.getById(id);
    if (!result.success || !result.data) return result as ApiResponse<Project>;
    
    return projectsApi.update(id, { 
      title_draft: result.data.title_published || result.data.title_draft,
      description_draft: result.data.description_published,
    });
  },
};

export default projectsApi;
