import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionWrapper, SectionHeader } from './SectionWrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PreviewProject } from '@/services/api/preview';

interface ProjectsSectionProps {
  title: string;
  subtitle?: string | null;
  projects: PreviewProject[];
}

export function ProjectsSection({ title, subtitle, projects }: ProjectsSectionProps) {
  // Filter to featured projects only, limit to 3
  const featuredProjects = projects
    .filter(p => p.is_featured)
    .slice(0, 3);

  if (featuredProjects.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="projects">
      <SectionHeader 
        title={title} 
        subtitle={subtitle || undefined}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {featuredProjects.map((project, index) => {
          const technologies = (project.technologies as string[]) || [];
          
          return (
            <article
              key={project.id}
              className={cn(
                'group relative p-6 md:p-8 rounded-2xl',
                'bg-card border border-border',
                'transition-all duration-base card-hover',
                'animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Project image placeholder */}
              <div className="aspect-video mb-6 rounded-lg bg-muted overflow-hidden">
                {project.thumbnail_url ? (
                  <img 
                    src={project.thumbnail_url} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Project Preview</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 className="text-xl font-serif text-foreground mb-2 group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Tags */}
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {technologies.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Link */}
              <Link
                to={`/projects/${project.slug}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View Project
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </article>
          );
        })}
      </div>

      {/* View all link */}
      {projects.length > 3 && (
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/projects">
              View All Projects
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </SectionWrapper>
  );
}
