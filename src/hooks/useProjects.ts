import { useState, useEffect, useCallback } from 'react';
import { projectsApi, type Project } from '@/services/api/projects';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await projectsApi.list();
      
      if (result.success && result.data) {
        setProjects(result.data.sort((a, b) => a.display_order - b.display_order));
      } else {
        setError(result.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (data: {
    slug: string;
    title: string;
    description?: string;
    technologies?: string[];
  }) => {
    const result = await projectsApi.create({
      ...data,
      display_order: projects.length,
    });
    
    if (result.success && result.data) {
      setProjects(prev => [...prev, result.data!]);
    }
    
    return result;
  }, [projects.length]);

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    const result = await projectsApi.update(id, data);
    
    if (result.success && result.data) {
      setProjects(prev => 
        prev.map(p => p.id === id ? { ...p, ...result.data } : p)
      );
    }
    
    return result;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const result = await projectsApi.delete(id);
    
    if (result.success) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
    
    return result;
  }, []);

  const toggleVisibility = useCallback(async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return { success: false, error: 'Project not found' };
    
    return updateProject(id, { is_visible: !project.is_visible });
  }, [projects, updateProject]);

  const toggleFeatured = useCallback(async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return { success: false, error: 'Project not found' };
    
    return updateProject(id, { is_featured: !project.is_featured });
  }, [projects, updateProject]);

  const reorderProjects = useCallback(async (newOrder: { id: string; display_order: number }[]) => {
    const result = await projectsApi.reorder(newOrder);
    
    if (result.success) {
      setProjects(prev => {
        const updated = [...prev];
        for (const item of newOrder) {
          const idx = updated.findIndex(p => p.id === item.id);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], display_order: item.display_order };
          }
        }
        return updated.sort((a, b) => a.display_order - b.display_order);
      });
    }
    
    return result;
  }, []);

  const publishProject = useCallback(async (id: string) => {
    const result = await projectsApi.publish(id);
    
    if (result.success) {
      await fetchProjects();
    }
    
    return result;
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    toggleVisibility,
    toggleFeatured,
    reorderProjects,
    publishProject,
  };
};
