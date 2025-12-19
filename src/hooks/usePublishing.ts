import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type ContentType = 'project' | 'section' | 'settings';

export interface DraftItem {
  id: string;
  type: ContentType;
  name: string;
  hasChanges: boolean;
  lastModified?: Date;
}

interface PublishResult {
  success: boolean;
  error?: string;
}

// Storage keys
const STORAGE_KEYS = {
  project: (id: string) => `project_${id}`,
  section: (id: string) => `section_${id}`,
  settings: () => 'settings',
};

const getDraftKey = (type: ContentType, id: string) => `${STORAGE_KEYS[type](id)}_draft`;
const getPublishedKey = (type: ContentType, id: string) => `${STORAGE_KEYS[type](id)}_published`;

export const usePublishing = () => {
  const [isPublishing, setIsPublishing] = useState(false);

  // Check if item has unpublished changes
  const hasUnpublishedChanges = useCallback((type: ContentType, id: string): boolean => {
    const draftKey = getDraftKey(type, id);
    const publishedKey = getPublishedKey(type, id);
    
    const draft = localStorage.getItem(draftKey);
    const published = localStorage.getItem(publishedKey);
    
    if (!draft) return false;
    if (!published) return true;
    
    return draft !== published;
  }, []);

  // Get all items with unpublished changes
  const getUnpublishedItems = useCallback((): DraftItem[] => {
    const items: DraftItem[] = [];
    
    // Check settings
    if (hasUnpublishedChanges('settings', 'global')) {
      items.push({
        id: 'global',
        type: 'settings',
        name: 'Site Settings',
        hasChanges: true,
      });
    }
    
    // Check projects (scan localStorage for project drafts)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('project_') && key.endsWith('_draft')) {
        const id = key.replace('project_', '').replace('_draft', '');
        if (hasUnpublishedChanges('project', id)) {
          const draft = localStorage.getItem(key);
          const data = draft ? JSON.parse(draft) : null;
          items.push({
            id,
            type: 'project',
            name: data?.title || `Project ${id}`,
            hasChanges: true,
          });
        }
      }
    }
    
    // Check sections
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('section_') && key.endsWith('_draft')) {
        const id = key.replace('section_', '').replace('_draft', '');
        if (hasUnpublishedChanges('section', id)) {
          const draft = localStorage.getItem(key);
          const data = draft ? JSON.parse(draft) : null;
          items.push({
            id,
            type: 'section',
            name: data?.name || `Section ${id}`,
            hasChanges: true,
          });
        }
      }
    }
    
    return items;
  }, [hasUnpublishedChanges]);

  // Publish a single item
  const publishItem = useCallback(async (type: ContentType, id: string): Promise<PublishResult> => {
    setIsPublishing(true);
    
    try {
      const draftKey = getDraftKey(type, id);
      const publishedKey = getPublishedKey(type, id);
      
      const draft = localStorage.getItem(draftKey);
      
      if (!draft) {
        return { success: false, error: 'No draft found to publish' };
      }
      
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Copy draft to published
      localStorage.setItem(publishedKey, draft);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to publish. Please try again.' };
    } finally {
      setIsPublishing(false);
    }
  }, []);

  // Publish all unpublished items
  const publishAll = useCallback(async (): Promise<PublishResult> => {
    setIsPublishing(true);
    
    try {
      const items = getUnpublishedItems();
      
      if (items.length === 0) {
        return { success: false, error: 'No changes to publish' };
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let failedCount = 0;
      
      for (const item of items) {
        const result = await publishItem(item.type, item.id);
        if (!result.success) {
          failedCount++;
        }
      }
      
      if (failedCount > 0) {
        return { 
          success: false, 
          error: `Failed to publish ${failedCount} item${failedCount > 1 ? 's' : ''}` 
        };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to publish all changes. Please try again.' };
    } finally {
      setIsPublishing(false);
    }
  }, [getUnpublishedItems, publishItem]);

  // Discard changes - revert to last published version
  const discardChanges = useCallback((type: ContentType, id: string): boolean => {
    const draftKey = getDraftKey(type, id);
    const publishedKey = getPublishedKey(type, id);
    
    const published = localStorage.getItem(publishedKey);
    
    if (published) {
      localStorage.setItem(draftKey, published);
      return true;
    } else {
      // No published version, remove draft
      localStorage.removeItem(draftKey);
      return true;
    }
  }, []);

  // Discard all changes
  const discardAll = useCallback((): boolean => {
    const items = getUnpublishedItems();
    
    for (const item of items) {
      discardChanges(item.type, item.id);
    }
    
    return true;
  }, [getUnpublishedItems, discardChanges]);

  // Save draft
  const saveDraft = useCallback((type: ContentType, id: string, data: unknown): void => {
    const draftKey = getDraftKey(type, id);
    localStorage.setItem(draftKey, JSON.stringify(data));
  }, []);

  // Get draft
  const getDraft = useCallback(<T>(type: ContentType, id: string): T | null => {
    const draftKey = getDraftKey(type, id);
    const draft = localStorage.getItem(draftKey);
    return draft ? JSON.parse(draft) : null;
  }, []);

  // Get published version
  const getPublished = useCallback(<T>(type: ContentType, id: string): T | null => {
    const publishedKey = getPublishedKey(type, id);
    const published = localStorage.getItem(publishedKey);
    return published ? JSON.parse(published) : null;
  }, []);

  return {
    isPublishing,
    hasUnpublishedChanges,
    getUnpublishedItems,
    publishItem,
    publishAll,
    discardChanges,
    discardAll,
    saveDraft,
    getDraft,
    getPublished,
  };
};
