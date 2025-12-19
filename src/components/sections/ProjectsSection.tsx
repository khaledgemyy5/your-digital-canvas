import { ArrowUpRight } from 'lucide-react';
import { SectionWrapper, SectionHeader } from './SectionWrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Project {
  title: string;
  summary: string;
  tags: string[];
  href?: string;
}

const projects: Project[] = [
  {
    title: 'E-Commerce Platform',
    summary: 'A full-featured online marketplace with real-time inventory, secure payments, and analytics dashboard.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    href: '#',
  },
  {
    title: 'Analytics Dashboard',
    summary: 'Interactive data visualization platform for business intelligence with custom reporting features.',
    tags: ['TypeScript', 'D3.js', 'Python', 'AWS'],
    href: '#',
  },
  {
    title: 'Developer Tools Suite',
    summary: 'CLI and web tools for automating development workflows and improving team productivity.',
    tags: ['Go', 'React', 'Docker', 'CI/CD'],
    href: '#',
  },
];

export function ProjectsSection() {
  return (
    <SectionWrapper id="projects">
      <SectionHeader 
        title="Featured Projects" 
        subtitle="Some of the work I'm most proud of."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {projects.map((project, index) => (
          <article
            key={project.title}
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
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Project Preview</span>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-serif text-foreground mb-2 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.summary}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Link */}
            {project.href && (
              <a
                href={project.href}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View Project
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </article>
        ))}
      </div>

      {/* View all link */}
      <div className="mt-12 text-center">
        <Button variant="outline" size="lg">
          View All Projects
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
