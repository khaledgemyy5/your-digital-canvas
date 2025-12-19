import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, MoreHorizontal, Edit, Globe, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { projectsApi, type Project } from '@/services/api/projects';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Projects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await projectsApi.list();
      
      if (result.success && result.data) {
        // Filter out deleted projects and sort by display_order
        const activeProjects = result.data
          .filter(p => !p.deleted_at)
          .sort((a, b) => a.display_order - b.display_order);
        setProjects(activeProjects);
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

  const toggleVisibility = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    // Optimistic update
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, is_visible: !p.is_visible } : p))
    );

    const result = await projectsApi.update(id, { is_visible: !project.is_visible });
    
    if (!result.success) {
      // Revert on error
      setProjects(prev =>
        prev.map(p => (p.id === id ? { ...p, is_visible: project.is_visible } : p))
      );
      toast({
        variant: 'destructive',
        description: result.error || 'Failed to update visibility',
      });
    } else {
      toast({
        description: result.data?.is_visible ? 'Project visible' : 'Project hidden',
      });
    }
  };

  const handlePublish = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const result = await projectsApi.publish(id);
    
    if (result.success) {
      // Refresh to get updated state
      await fetchProjects();
      toast({
        description: 'Project published',
      });
    } else {
      toast({
        variant: 'destructive',
        description: result.error || 'Failed to publish project',
      });
    }
  };

  const handleDelete = (id: string) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    const result = await projectsApi.delete(projectToDelete);
    
    if (result.success) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      toast({
        description: 'Project deleted',
      });
    } else {
      toast({
        variant: 'destructive',
        description: result.error || 'Failed to delete project',
      });
    }
    
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleCreate = async () => {
    const slug = `project-${Date.now()}`;
    const result = await projectsApi.create({
      slug,
      title_draft: 'Untitled Project',
      display_order: projects.length,
    });

    if (result.success && result.data) {
      toast({
        description: 'Project created',
      });
      navigate(`/admin/projects/${result.data.id}`);
    } else {
      toast({
        variant: 'destructive',
        description: result.error || 'Failed to create project',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchProjects}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          New Project
        </Button>
      </div>

      {/* Projects List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {projects.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No projects yet. Create your first project.
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {project.title_draft}
                      </span>
                      {project.external_url && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {project.description_draft || 'No description'}
                    </p>
                  </div>

                  {/* Status */}
                  <Badge
                    variant={project.is_published ? 'default' : 'secondary'}
                    className="text-xs shrink-0"
                  >
                    {project.is_published ? 'Published' : 'Draft'}
                  </Badge>

                  {/* Last Edited */}
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {formatDate(project.updated_at)}
                  </span>

                  {/* Visibility Toggle */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {project.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                    <Switch
                      checked={project.is_visible}
                      onCheckedChange={() => toggleVisibility(project.id)}
                    />
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/projects/${project.id}`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePublish(project.id)}>
                        <Globe className="h-4 w-4 mr-2" />
                        Publish
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This project will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
