import { useState, useEffect, useCallback } from 'react';
import { previewApi, type PreviewData } from '@/services/api/preview';

/**
 * Hook for fetching draft preview data (admin only).
 * Similar to usePublicSite but fetches draft content instead of published.
 */
export const usePreviewSite = () => {
  const [data, setData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch draft content for preview
      const result = await previewApi.getSite('draft');
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch preview data');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteData();
  }, [fetchSiteData]);

  // Helper to get visible sections in order with bullets mapped (from draft)
  const getVisibleSections = useCallback(() => {
    if (!data?.sections) return [];
    return data.sections
      .filter(s => s.is_visible)
      .sort((a, b) => a.display_order - b.display_order)
      .map(section => ({
        ...section,
        // Map bullets to have proper content field from draft data
        bullets: (section.bullets || [])
          .filter(b => !b.deleted_at)
          .sort((a, b) => a.display_order - b.display_order)
          .map(b => ({
            id: b.id,
            content: b.content || '',
            display_order: b.display_order,
          })),
      }));
  }, [data]);

  // Helper to get visible projects in order (from draft)
  const getVisibleProjects = useCallback(() => {
    if (!data?.projects) return [];
    return data.projects
      .filter(p => p.is_visible)
      .sort((a, b) => a.display_order - b.display_order);
  }, [data]);

  // Helper to get featured projects (from draft)
  const getFeaturedProjects = useCallback(() => {
    if (!data?.projects) return [];
    return data.projects
      .filter(p => p.is_visible && p.is_featured)
      .sort((a, b) => a.display_order - b.display_order);
  }, [data]);

  // Get site settings
  const getSiteSettings = useCallback(() => {
    return data?.siteSettings || {};
  }, [data]);

  // Get theme settings
  const getThemeSettings = useCallback(() => {
    return data?.themeSettings || {};
  }, [data]);

  // Get social links
  const getSocialLinks = useCallback(() => {
    if (!data?.socialLinks) return [];
    return data.socialLinks.filter(l => l.is_visible);
  }, [data]);

  // Get resume
  const getResume = useCallback(() => {
    return data?.resume;
  }, [data]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSiteData,
    getVisibleSections,
    getVisibleProjects,
    getFeaturedProjects,
    getSiteSettings,
    getThemeSettings,
    getSocialLinks,
    getResume,
  };
};
