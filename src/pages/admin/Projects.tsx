import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, MoreHorizontal, Edit, Globe, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  summary: string;
  status: 'draft' | 'published';
  visible: boolean;
  hasPublicPage: boolean;
  lastEdited: string;
  deleted: boolean;
}

const initialProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    summary: 'Full-stack online shopping solution',
    status: 'published',
    visible: true,
    hasPublicPage: true,
    lastEdited: '2024-01-18T10:30:00',
    deleted: false,
  },
  {
    id: '2',
    title: 'Task Management App',
    summary: 'Collaborative project management tool',
    status: 'published',
    visible: true,
    hasPublicPage: true,
    lastEdited: '2024-01-17T15:45:00',
    deleted: false,
  },
  {
    id: '3',
    title: 'Portfolio Website',
    summary: 'Personal portfolio with CMS',
    status: 'draft',
    visible: true,
    hasPublicPage: false,
    lastEdited: '2024-01-16T09:00:00',
    deleted: false,
  },
  {
    id: '4',
    title: 'Analytics Dashboard',
    summary: 'Real-time data visualization',
    status: 'published',
    visible: false,
    hasPublicPage: true,
    lastEdited: '2024-01-10T14:20:00',
    deleted: false,
  },
];

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
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const activeProjects = projects.filter((p) => !p.deleted);

  const toggleVisibility = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p))
    );
  };

  const toggleStatus = (id: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'published' ? 'draft' : 'published' }
          : p
      )
    );
    const project = projects.find((p) => p.id === id);
    toast({
      description: project?.status === 'published' ? 'Project unpublished' : 'Project published',
    });
  };

  const handleDelete = (id: string) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!projectToDelete) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectToDelete ? { ...p, deleted: true } : p))
    );
    toast({
      description: 'Project moved to trash',
    });
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleCreate = () => {
    const newId = String(Date.now());
    const newProject: Project = {
      id: newId,
      title: 'Untitled Project',
      summary: '',
      status: 'draft',
      visible: false,
      hasPublicPage: false,
      lastEdited: new Date().toISOString(),
      deleted: false,
    };
    setProjects((prev) => [newProject, ...prev]);
    navigate(`/admin/projects/${newId}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''}
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
            {activeProjects.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No projects yet. Create your first project.
              </div>
            ) : (
              activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {project.title}
                      </span>
                      {project.hasPublicPage && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {project.summary || 'No description'}
                    </p>
                  </div>

                  {/* Status */}
                  <Badge
                    variant={project.status === 'published' ? 'default' : 'secondary'}
                    className="text-xs shrink-0"
                  >
                    {project.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>

                  {/* Last Edited */}
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {formatDate(project.lastEdited)}
                  </span>

                  {/* Visibility Toggle */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {project.visible ? 'Visible' : 'Hidden'}
                    </span>
                    <Switch
                      checked={project.visible}
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
                      <DropdownMenuItem onClick={() => toggleStatus(project.id)}>
                        <Globe className="h-4 w-4 mr-2" />
                        {project.status === 'published' ? 'Unpublish' : 'Publish'}
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
              This project will be moved to trash. You can restore it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
