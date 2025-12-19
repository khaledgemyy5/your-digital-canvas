import { useState, useEffect, useCallback } from 'react';
import { previewApi, type PreviewData } from '@/services/api/preview';

export const usePublicSite = () => {
  const [data, setData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch published content for the public site
      const result = await previewApi.getSite('published');
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch site data');
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

  // Helper to get visible sections in order
  const getVisibleSections = useCallback(() => {
    if (!data?.sections) return [];
    return data.sections
      .filter(s => s.is_visible && s.is_published)
      .sort((a, b) => a.display_order - b.display_order);
  }, [data]);

  // Helper to get visible projects in order
  const getVisibleProjects = useCallback(() => {
    if (!data?.projects) return [];
    return data.projects
      .filter(p => p.is_visible && p.is_published)
      .sort((a, b) => a.display_order - b.display_order);
  }, [data]);

  // Helper to get featured projects
  const getFeaturedProjects = useCallback(() => {
    if (!data?.projects) return [];
    return data.projects
      .filter(p => p.is_visible && p.is_published && p.is_featured)
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
    return data.socialLinks.filter(l => l.is_visible && l.is_published);
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
