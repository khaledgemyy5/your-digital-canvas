import { useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { getDraftProject } from '@/contexts/PreviewContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Moon, Sun, X, ExternalLink, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const PreviewProject = () => {
  const { id } = useParams<{ id: string }>();
  const { theme, setTheme } = useTheme();
  const project = id ? getDraftProject(id) : undefined;

  const handleClose = () => {
    window.close();
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

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
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
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
                <p className="text-lg text-muted-foreground">
                  {project.summary}
                </p>
              </header>

              {/* Hero Image */}
              {project.images[0] && (
                <div className="aspect-video rounded-lg overflow-hidden mb-10 bg-muted">
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Tech Stack */}
              {project.technologies.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">
                    Technologies
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="prose prose-neutral dark:prose-invert max-w-none mb-10">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Role */}
              {project.role && (
                <div className="mb-10">
                  <h2 className="text-xl font-semibold mb-4">My Role</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.role}
                  </p>
                </div>
              )}

              {/* Additional Images */}
              {project.images.length > 1 && (
                <div className="mb-10">
                  <h2 className="text-xl font-semibold mb-4">Gallery</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {project.images.slice(1).map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-video rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={img}
                          alt={`${project.title} screenshot ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Link */}
              {project.link && (
                <div className="pt-6 border-t border-border">
                  <Button asChild>
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      View Project
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </article>
        </PublicLayout>
      </div>
    </div>
  );
};

export default PreviewProject;
