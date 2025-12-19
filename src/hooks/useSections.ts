import { useState, useEffect, useCallback } from 'react';
import { sectionsApi, type Section } from '@/services/api/sections';

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await sectionsApi.list();
      
      if (result.success && result.data) {
        setSections(result.data.sort((a, b) => a.display_order - b.display_order));
      } else {
        setError(result.error || 'Failed to fetch sections');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const updateSection = useCallback(async (id: string, data: Partial<Section>) => {
    const result = await sectionsApi.update(id, data);
    
    if (result.success) {
      setSections(prev => 
        prev.map(s => s.id === id ? { ...s, ...result.data } : s)
      );
    }
    
    return result;
  }, []);

  const toggleVisibility = useCallback(async (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return { success: false, error: 'Section not found' };
    
    return updateSection(id, { is_visible: !section.is_visible });
  }, [sections, updateSection]);

  const reorderSections = useCallback(async (newOrder: { id: string; display_order: number }[]) => {
    const result = await sectionsApi.reorder(newOrder);
    
    if (result.success) {
      setSections(prev => {
        const updated = [...prev];
        for (const item of newOrder) {
          const idx = updated.findIndex(s => s.id === item.id);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], display_order: item.display_order };
          }
        }
        return updated.sort((a, b) => a.display_order - b.display_order);
      });
    }
    
    return result;
  }, []);

  const publishSection = useCallback(async (id: string) => {
    const result = await sectionsApi.publish(id);
    
    if (result.success) {
      // Refresh to get updated published state
      await fetchSections();
    }
    
    return result;
  }, [fetchSections]);

  return {
    sections,
    isLoading,
    error,
    refetch: fetchSections,
    updateSection,
    toggleVisibility,
    reorderSections,
    publishSection,
  };
};
