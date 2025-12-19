import { useState, useCallback } from 'react';
import { publishApi } from '@/services/api/publish';
import { sectionsApi, type Section } from '@/services/api/sections';
import { projectsApi, type Project } from '@/services/api/projects';

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

export const usePublishing = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [unpublishedItems, setUnpublishedItems] = useState<DraftItem[]>([]);

  // Fetch all items and determine which have unpublished changes
  const refreshUnpublishedItems = useCallback(async (): Promise<DraftItem[]> => {
    const items: DraftItem[] = [];
    
    try {
      // Fetch sections
      const sectionsResult = await sectionsApi.list();
      if (sectionsResult.success && sectionsResult.data) {
        for (const section of sectionsResult.data) {
          // Check if draft differs from published
          const draftContent = JSON.stringify(section.content_draft);
          const publishedContent = JSON.stringify(section.content_published);
          
          if (!section.is_published || draftContent !== publishedContent) {
            items.push({
              id: section.id,
              type: 'section',
              name: section.title,
              hasChanges: true,
              lastModified: new Date(section.updated_at),
            });
          }
        }
      }
      
      // Fetch projects
      const projectsResult = await projectsApi.list();
      if (projectsResult.success && projectsResult.data) {
        for (const project of projectsResult.data) {
          // Check if draft differs from published
          if (!project.is_published || 
              project.title_draft !== project.title_published ||
              project.description_draft !== project.description_published) {
            items.push({
              id: project.id,
              type: 'project',
              name: project.title_draft,
              hasChanges: true,
              lastModified: new Date(project.updated_at),
            });
          }
        }
      }
      
      setUnpublishedItems(items);
      return items;
    } catch (error) {
      console.error('Error fetching unpublished items:', error);
      return [];
    }
  }, []);

  // Get cached unpublished items
  const getUnpublishedItems = useCallback((): DraftItem[] => {
    return unpublishedItems;
  }, [unpublishedItems]);

  // Publish a single item
  const publishItem = useCallback(async (type: ContentType, id: string): Promise<PublishResult> => {
    setIsPublishing(true);
    
    try {
      let result;
      
      switch (type) {
        case 'section':
          result = await publishApi.publishSection(id);
          break;
        case 'project':
          result = await publishApi.publishProject(id);
          break;
        case 'settings':
          result = await publishApi.publishSettings();
          break;
        default:
          return { success: false, error: 'Unknown content type' };
      }
      
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to publish' };
      }
      
      // Refresh the list
      await refreshUnpublishedItems();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to publish. Please try again.' };
    } finally {
      setIsPublishing(false);
    }
  }, [refreshUnpublishedItems]);

  // Publish all unpublished items
  const publishAll = useCallback(async (): Promise<PublishResult> => {
    setIsPublishing(true);
    
    try {
      const result = await publishApi.publishAll();
      
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to publish all changes' };
      }
      
      // Refresh the list
      await refreshUnpublishedItems();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to publish all changes. Please try again.' };
    } finally {
      setIsPublishing(false);
    }
  }, [refreshUnpublishedItems]);

  // Discard changes - this would need to reload from published version
  const discardChanges = useCallback((type: ContentType, id: string): boolean => {
    // For now, this is a no-op since we'd need to implement revert functionality
    // The API would need an endpoint to revert draft to published
    console.log('Discard changes for', type, id);
    return true;
  }, []);

  // Discard all changes
  const discardAll = useCallback((): boolean => {
    console.log('Discard all changes');
    return true;
  }, []);

  // Save draft (placeholder for compatibility)
  const saveDraft = useCallback((type: ContentType, id: string, data: unknown): void => {
    console.log('Save draft', type, id, data);
  }, []);

  // Get draft (placeholder)
  const getDraft = useCallback(<T>(_type: ContentType, _id: string): T | null => {
    return null;
  }, []);

  // Get published (placeholder)
  const getPublished = useCallback(<T>(_type: ContentType, _id: string): T | null => {
    return null;
  }, []);

  // Has unpublished changes (placeholder)
  const hasUnpublishedChanges = useCallback((_type: ContentType, _id: string): boolean => {
    return false;
  }, []);

  return {
    isPublishing,
    getUnpublishedItems,
    refreshUnpublishedItems,
    publishItem,
    publishAll,
    discardChanges,
    discardAll,
    saveDraft,
    getDraft,
    getPublished,
    hasUnpublishedChanges,
  };
};
