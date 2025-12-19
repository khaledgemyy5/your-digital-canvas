import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { usePublicProject } from '@/hooks/usePublicProject';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Public Project Detail Page
 * 
 * Fetches and displays a single project by slug via the API.
 * Only shows published content.
 */
const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { project, isLoading, error } = usePublicProject(slug || '');

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-24 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-full mb-8" />
          <Skeleton className="aspect-video w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !project) {
    return (
      <PublicLayout>
        <div className="container py-24 text-center">
          <h1 className="text-2xl font-serif text-foreground mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">{error || 'The project you are looking for does not exist.'}</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const technologies = (project.technologies as string[]) || [];

  return (
    <PublicLayout>
      <article className="container py-24 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/#projects" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
            {project.title}
          </h1>
          
          {project.description && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Technologies */}
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex gap-4 mt-6">
            {project.external_url && (
              <Button asChild>
                <a href={project.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live
                </a>
              </Button>
            )}
            {project.github_url && (
              <Button variant="outline" asChild>
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  Source Code
                </a>
              </Button>
            )}
          </div>
        </header>

        {/* Thumbnail */}
        {project.thumbnail_url && (
          <div className="aspect-video mb-12 rounded-2xl overflow-hidden bg-muted">
            <img 
              src={project.thumbnail_url} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Project Pages / Content */}
        {project.pages && project.pages.length > 0 && (
          <div className="prose prose-lg max-w-none">
            {project.pages.map((page: any) => (
              <div key={page.id}>
                {page.content?.body && (
                  <div dangerouslySetInnerHTML={{ __html: page.content.body }} />
                )}
              </div>
            ))}
          </div>
        )}
      </article>
    </PublicLayout>
  );
};

export default ProjectDetail;
