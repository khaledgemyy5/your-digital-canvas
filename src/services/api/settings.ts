/**
 * Settings API Service
 * All settings-related API calls go through this service.
 */

import apiClient from './client';
import type { SiteSettings, ApiResponse } from '@/types';

export const settingsApi = {
  // Get current site settings (public - limited fields)
  getPublic: (): Promise<ApiResponse<Partial<SiteSettings>>> =>
    apiClient.get<Partial<SiteSettings>>('/settings/public'),

  // Get full settings (admin)
  get: (): Promise<ApiResponse<SiteSettings>> =>
    apiClient.get<SiteSettings>('/settings'),

  // Update settings (admin)
  update: (data: Partial<SiteSettings>): Promise<ApiResponse<SiteSettings>> =>
    apiClient.patch<SiteSettings>('/settings', data),

  // Update accent color
  updateAccentColor: (color: string): Promise<ApiResponse<SiteSettings>> =>
    apiClient.patch<SiteSettings>('/settings/accent-color', { color }),

  // Update resume URL
  updateResumeUrl: (url: string): Promise<ApiResponse<SiteSettings>> =>
    apiClient.patch<SiteSettings>('/settings/resume', { url }),

  // Update social links
  updateSocialLinks: (links: SiteSettings['socialLinks']): Promise<ApiResponse<SiteSettings>> =>
    apiClient.patch<SiteSettings>('/settings/social-links', { links }),
};

export default settingsApi;
