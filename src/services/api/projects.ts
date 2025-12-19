/**
 * Projects API Service
 * All project-related API calls go through this service.
 */

import apiClient from './client';
import type { Project, ApiResponse, PaginatedResponse } from '@/types';

export const projectsApi = {
  // Get all published projects (public)
  getPublished: (): Promise<ApiResponse<Project[]>> =>
    apiClient.get<Project[]>('/projects/published'),

  // Get featured projects (public)
  getFeatured: (): Promise<ApiResponse<Project[]>> =>
    apiClient.get<Project[]>('/projects/featured'),

  // Get all projects including drafts (admin)
  getAll: (): Promise<ApiResponse<Project[]>> =>
    apiClient.get<Project[]>('/projects'),

  // Get paginated projects (admin)
  getPaginated: (page: number, pageSize: number): Promise<ApiResponse<PaginatedResponse<Project>>> =>
    apiClient.get<PaginatedResponse<Project>>(`/projects?page=${page}&pageSize=${pageSize}`),

  // Get single project by ID
  getById: (id: string): Promise<ApiResponse<Project>> =>
    apiClient.get<Project>(`/projects/${id}`),

  // Get project by slug (public)
  getBySlug: (slug: string): Promise<ApiResponse<Project>> =>
    apiClient.get<Project>(`/projects/slug/${slug}`),

  // Create new project (admin)
  create: (data: Partial<Project>): Promise<ApiResponse<Project>> =>
    apiClient.post<Project>('/projects', data),

  // Update project (saves as draft)
  update: (id: string, data: Partial<Project>): Promise<ApiResponse<Project>> =>
    apiClient.patch<Project>(`/projects/${id}`, data),

  // Publish project
  publish: (id: string): Promise<ApiResponse<Project>> =>
    apiClient.post<Project>(`/projects/${id}/publish`),

  // Revert to published version
  discardDraft: (id: string): Promise<ApiResponse<Project>> =>
    apiClient.post<Project>(`/projects/${id}/discard-draft`),

  // Toggle visibility
  toggleVisibility: (id: string): Promise<ApiResponse<Project>> =>
    apiClient.post<Project>(`/projects/${id}/toggle-visibility`),

  // Toggle featured status
  toggleFeatured: (id: string): Promise<ApiResponse<Project>> =>
    apiClient.post<Project>(`/projects/${id}/toggle-featured`),

  // Soft delete
  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete<void>(`/projects/${id}`),
};

export default projectsApi;
