/**
 * Publish API Service
 * Handles publishing workflow operations.
 */

import apiClient from './client';
import type { ApiResponse } from '@/types';

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
  // Get publish status overview
  getStatus: (): Promise<ApiResponse<PublishStatus>> =>
    apiClient.get<PublishStatus>('/publish/status'),

  // Get all pending drafts
  getPendingDrafts: (): Promise<ApiResponse<DraftItem[]>> =>
    apiClient.get<DraftItem[]>('/publish/pending'),

  // Publish all pending changes
  publishAll: (): Promise<ApiResponse<PublishResult>> =>
    apiClient.post<PublishResult>('/publish/all'),

  // Publish specific items
  publishItems: (itemIds: string[]): Promise<ApiResponse<PublishResult>> =>
    apiClient.post<PublishResult>('/publish/items', { itemIds }),

  // Discard all drafts
  discardAll: (): Promise<ApiResponse<void>> =>
    apiClient.post<void>('/publish/discard-all'),
};

export default publishApi;
