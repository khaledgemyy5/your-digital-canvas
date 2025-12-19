/**
 * Sections API Service
 * All section-related API calls go through this service.
 */

import apiClient from './client';
import type { Section, ApiResponse } from '@/types';

export const sectionsApi = {
  // Get all published sections (public)
  getPublished: (): Promise<ApiResponse<Section[]>> =>
    apiClient.get<Section[]>('/sections/published'),

  // Get all sections including drafts (admin)
  getAll: (): Promise<ApiResponse<Section[]>> =>
    apiClient.get<Section[]>('/sections'),

  // Get single section by ID
  getById: (id: string): Promise<ApiResponse<Section>> =>
    apiClient.get<Section>(`/sections/${id}`),

  // Get section by type
  getByType: (type: string): Promise<ApiResponse<Section>> =>
    apiClient.get<Section>(`/sections/type/${type}`),

  // Create new section (admin)
  create: (data: Partial<Section>): Promise<ApiResponse<Section>> =>
    apiClient.post<Section>('/sections', data),

  // Update section (saves as draft)
  update: (id: string, data: Partial<Section>): Promise<ApiResponse<Section>> =>
    apiClient.patch<Section>(`/sections/${id}`, data),

  // Publish section
  publish: (id: string): Promise<ApiResponse<Section>> =>
    apiClient.post<Section>(`/sections/${id}/publish`),

  // Revert to published version
  discardDraft: (id: string): Promise<ApiResponse<Section>> =>
    apiClient.post<Section>(`/sections/${id}/discard-draft`),

  // Reorder sections
  reorder: (orderedIds: string[]): Promise<ApiResponse<void>> =>
    apiClient.post<void>('/sections/reorder', { orderedIds }),

  // Toggle visibility
  toggleVisibility: (id: string): Promise<ApiResponse<Section>> =>
    apiClient.post<Section>(`/sections/${id}/toggle-visibility`),
};

export default sectionsApi;
