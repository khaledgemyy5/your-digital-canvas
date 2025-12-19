import { useState, useEffect, useCallback } from 'react';
import { previewApi, type PreviewProject } from '@/services/api/preview';

export const usePublicProject = (slug: string) => {
  const [project, setProject] = useState<PreviewProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!slug) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch published content only for public site
      const result = await previewApi.getProjectBySlug(slug, 'published');
      
      if (result.success && result.data) {
        setProject(result.data);
      } else {
        setError(result.error || 'Project not found');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    isLoading,
    error,
    refetch: fetchProject,
  };
};
