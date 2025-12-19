/**
 * API Client - Provider Agnostic
 * This module provides a clean interface to the REST API.
 * Can be easily swapped to point to AWS API Gateway.
 */

// Types for API responses
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

// Get the API base URL from environment
const getApiBaseUrl = (): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is not configured');
  }
  return `${supabaseUrl}/functions/v1`;
};

// Token storage (can be swapped for different storage mechanisms)
const tokenStorage = {
  getAccessToken: (): string | null => {
    return sessionStorage.getItem('access_token');
  },
  getRefreshToken: (): string | null => {
    return sessionStorage.getItem('refresh_token');
  },
  setTokens: (accessToken: string, refreshToken: string, expiresAt: number): void => {
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('refresh_token', refreshToken);
    sessionStorage.setItem('expires_at', expiresAt.toString());
  },
  clearTokens: (): void => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('expires_at');
  },
  getExpiresAt: (): number | null => {
    const val = sessionStorage.getItem('expires_at');
    return val ? parseInt(val, 10) : null;
  },
};

// Generic fetch wrapper with auth
const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const baseUrl = getApiBaseUrl();
  const accessToken = tokenStorage.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Request failed' };
    }

    return { data: json.data ?? json, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Network error' };
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; session: Session }>> => {
    const result = await fetchWithAuth<{ user: User; session: Session }>('/api-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.data?.session) {
      tokenStorage.setTokens(
        result.data.session.access_token,
        result.data.session.refresh_token,
        result.data.session.expires_at
      );
    }
    
    return result;
  },
  
  logout: async (): Promise<ApiResponse<void>> => {
    const result = await fetchWithAuth<void>('/api-auth/logout', {
      method: 'POST',
    });
    tokenStorage.clearTokens();
    return result;
  },
  
  getMe: async (): Promise<ApiResponse<User>> => {
    return fetchWithAuth<User>('/api-auth/me');
  },
  
  refreshToken: async (): Promise<ApiResponse<{ session: Session }>> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return { data: null, error: 'No refresh token' };
    }
    
    const result = await fetchWithAuth<{ session: Session }>('/api-auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (result.data?.session) {
      tokenStorage.setTokens(
        result.data.session.access_token,
        result.data.session.refresh_token,
        result.data.session.expires_at
      );
    }
    
    return result;
  },
  
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  resetPassword: async (password: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
  
  isAuthenticated: (): boolean => {
    const token = tokenStorage.getAccessToken();
    const expiresAt = tokenStorage.getExpiresAt();
    if (!token || !expiresAt) return false;
    return Date.now() < expiresAt * 1000;
  },
  
  getAccessToken: (): string | null => tokenStorage.getAccessToken(),
};

// Sections API
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
  bullets?: SectionBullet[];
}

export interface SectionBullet {
  id: string;
  section_id: string;
  content_draft: string | null;
  content_published: string | null;
  display_order: number;
  is_published: boolean;
}

export const sectionsApi = {
  list: async (): Promise<ApiResponse<Section[]>> => {
    return fetchWithAuth<Section[]>('/api-sections');
  },
  
  get: async (id: string): Promise<ApiResponse<Section>> => {
    return fetchWithAuth<Section>(`/api-sections/${id}`);
  },
  
  create: async (section: Partial<Section>): Promise<ApiResponse<Section>> => {
    return fetchWithAuth<Section>('/api-sections', {
      method: 'POST',
      body: JSON.stringify(section),
    });
  },
  
  update: async (id: string, section: Partial<Section>): Promise<ApiResponse<Section>> => {
    return fetchWithAuth<Section>(`/api-sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(section),
    });
  },
  
  delete: async (id: string): Promise<ApiResponse<Section>> => {
    return fetchWithAuth<Section>(`/api-sections/${id}`, {
      method: 'DELETE',
    });
  },
  
  reorder: async (items: { id: string; display_order: number }[]): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-sections/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  },
};

// Projects API
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
  list: async (): Promise<ApiResponse<Project[]>> => {
    return fetchWithAuth<Project[]>('/api-projects');
  },
  
  get: async (id: string): Promise<ApiResponse<Project>> => {
    return fetchWithAuth<Project>(`/api-projects/${id}`);
  },
  
  create: async (project: Partial<Project>): Promise<ApiResponse<Project>> => {
    return fetchWithAuth<Project>('/api-projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },
  
  update: async (id: string, project: Partial<Project>): Promise<ApiResponse<Project>> => {
    return fetchWithAuth<Project>(`/api-projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },
  
  delete: async (id: string): Promise<ApiResponse<Project>> => {
    return fetchWithAuth<Project>(`/api-projects/${id}`, {
      method: 'DELETE',
    });
  },
  
  reorder: async (items: { id: string; display_order: number }[]): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-projects/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  },
};

// Settings API
export interface SiteSettings {
  site_title?: { draft: string; published: string };
  meta_description?: { draft: string; published: string };
  contact_email?: { draft: string; published: string };
  [key: string]: unknown;
}

export interface ThemeSettings {
  mode?: { draft: string; published: string };
  accent_color?: { draft: string; published: string };
  font_family?: { draft: string; published: string };
  [key: string]: unknown;
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
  getSiteSettings: async (): Promise<ApiResponse<SiteSettings>> => {
    return fetchWithAuth<SiteSettings>('/api-settings/site');
  },
  
  updateSiteSettings: async (settings: Record<string, unknown>): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-settings/site', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
  
  getThemeSettings: async (): Promise<ApiResponse<ThemeSettings>> => {
    return fetchWithAuth<ThemeSettings>('/api-settings/theme');
  },
  
  updateThemeSettings: async (settings: Record<string, unknown>): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-settings/theme', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
  
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
  
  deleteSocialLink: async (id: string): Promise<ApiResponse<SocialLink>> => {
    return fetchWithAuth<SocialLink>(`/api-settings/social/${id}`, {
      method: 'DELETE',
    });
  },
  
  getResume: async (): Promise<ApiResponse<ResumeAsset>> => {
    return fetchWithAuth<ResumeAsset>('/api-settings/resume');
  },
  
  updateResume: async (resume: Partial<ResumeAsset>): Promise<ApiResponse<ResumeAsset>> => {
    return fetchWithAuth<ResumeAsset>('/api-settings/resume', {
      method: 'PUT',
      body: JSON.stringify(resume),
    });
  },
};

// Publish API
export const publishApi = {
  publishSection: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/api-publish/section/${id}`, {
      method: 'POST',
    });
  },
  
  publishProject: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/api-publish/project/${id}`, {
      method: 'POST',
    });
  },
  
  publishSettings: async (): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-publish/settings', {
      method: 'POST',
    });
  },
  
  publishAll: async (): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>('/api-publish/all', {
      method: 'POST',
    });
  },
};

// Preview API
export interface PreviewData {
  sections: Array<Section & { content: Record<string, unknown>; bullets: Array<SectionBullet & { content: string }> }>;
  projects: Array<Project & { title: string; description: string }>;
  siteSettings: Record<string, unknown>;
  themeSettings: Record<string, unknown>;
  socialLinks: Array<SocialLink & { url: string }>;
  resume: ResumeAsset | null;
}

export const previewApi = {
  getSite: async (mode: 'draft' | 'published' = 'draft'): Promise<ApiResponse<PreviewData>> => {
    return fetchWithAuth<PreviewData>(`/api-preview/site?mode=${mode}`);
  },
  
  getSection: async (id: string, mode: 'draft' | 'published' = 'draft'): Promise<ApiResponse<Section>> => {
    return fetchWithAuth<Section>(`/api-preview/section/${id}?mode=${mode}`);
  },
  
  getProject: async (id: string, mode: 'draft' | 'published' = 'draft'): Promise<ApiResponse<Project>> => {
    return fetchWithAuth<Project>(`/api-preview/project/${id}?mode=${mode}`);
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  sections: sectionsApi,
  projects: projectsApi,
  settings: settingsApi,
  publish: publishApi,
  preview: previewApi,
};

export default api;
