import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { previewApi, type PreviewProject as PreviewProjectType } from '@/services/api/preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Moon, Sun, X, ExternalLink, ArrowLeft, RefreshCw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const PreviewProject = () => {
  const { id } = useParams<{ id: string }>();
  const { theme, setTheme } = useTheme();
  
  const [project, setProject] = useState<PreviewProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!id) {
      setError('No project ID provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const result = await previewApi.getProject(id, 'draft');
    
    if (result.success && result.data) {
      setProject(result.data);
    } else {
      setError(result.error || 'Failed to load project');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleClose = () => {
    window.close();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-warning/90 text-warning-foreground px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-background/20 border-background/40">
                Draft Preview
              </Badge>
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        </div>
        <div className="pt-10">
          <PublicLayout>
            <div className="py-16 px-4 max-w-4xl mx-auto space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </PublicLayout>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/90 text-destructive-foreground px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-background/20 border-background/40">
                Preview Error
              </Badge>
              <span className="text-sm font-medium">
                {error || 'Project not found'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/20"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="pt-10">
          <PublicLayout>
            <div className="py-24 text-center">
              <p className="text-destructive mb-4">{error || 'Project not found'}</p>
              <Button variant="outline" onClick={fetchProject}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </PublicLayout>
        </div>
      </div>
    );
  }

  const technologies = Array.isArray(project.technologies) ? project.technologies : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-warning/90 text-warning-foreground px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-background/20 border-background/40">
              Draft Preview
            </Badge>
            <span className="text-sm font-medium">
              Previewing: {project.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/20"
              onClick={fetchProject}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/20"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/20"
              onClick={handleClose}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Project Content */}
      <div className="pt-10">
        <PublicLayout>
          <article className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back link */}
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </button>

              {/* Header */}
              <header className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {project.title}
                </h1>
                {project.description && (
                  <p className="text-lg text-muted-foreground">
                    {project.description}
                  </p>
                )}
              </header>

              {/* Hero Image */}
              {project.thumbnail_url && (
                <div className="aspect-video rounded-lg overflow-hidden mb-10 bg-muted">
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Tech Stack */}
              {technologies.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">
                    Technologies
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-4 pt-6 border-t border-border">
                {project.external_url && (
                  <Button asChild>
                    <a href={project.external_url} target="_blank" rel="noopener noreferrer">
                      View Project
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
                {project.github_url && (
                  <Button variant="outline" asChild>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      View Source
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </article>
        </PublicLayout>
      </div>
    </div>
  );
};

export default PreviewProject;
