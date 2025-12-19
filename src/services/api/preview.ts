/**
 * Preview API Service
 * Handles preview functionality for draft content.
 */

import apiClient from './client';
import type { Section, Project, SiteSettings, ApiResponse } from '@/types';

interface FullSitePreview {
  sections: Section[];
  projects: Project[];
  settings: SiteSettings;
}

export const previewApi = {
  // Get preview of a single section (with draft content)
  getSection: (id: string): Promise<ApiResponse<Section>> =>
    apiClient.get<Section>(`/preview/sections/${id}`),

  // Get preview of a single project (with draft content)
  getProject: (id: string): Promise<ApiResponse<Project>> =>
    apiClient.get<Project>(`/preview/projects/${id}`),

  // Get full site preview (all content with drafts)
  getFullSite: (): Promise<ApiResponse<FullSitePreview>> =>
    apiClient.get<FullSitePreview>('/preview/full'),

  // Generate preview token (for shareable preview links)
  generatePreviewToken: (expiresInMinutes?: number): Promise<ApiResponse<{ token: string; expiresAt: string }>> =>
    apiClient.post<{ token: string; expiresAt: string }>('/preview/token', { expiresInMinutes }),

  // Validate preview token
  validatePreviewToken: (token: string): Promise<ApiResponse<{ valid: boolean }>> =>
    apiClient.get<{ valid: boolean }>(`/preview/validate?token=${token}`),
};

export default previewApi;
