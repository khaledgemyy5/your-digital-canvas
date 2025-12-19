import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { loadDraftData } from '@/contexts/PreviewContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Moon, Sun, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const PreviewSite = () => {
  const [searchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();
  const draftData = loadDraftData();

  const visibleSections = draftData.sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order);

  const visibleProjects = draftData.projects.filter(p => p.visible);

  const handleClose = () => {
    window.close();
  };

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
              You are viewing unpublished changes
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

      {/* Site Content with extra top padding for banner */}
      <div className="pt-10">
        <PublicLayout>
          {/* Hero - always shown */}
          <section className="py-20 md:py-32 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Your Name
              </h1>
              <p className="text-xl text-muted-foreground">
                Developer & Designer
              </p>
            </div>
          </section>

          {/* Dynamic Sections */}
          {visibleSections.map((section) => (
            <section key={section.id} className="py-16 px-4 border-t border-border">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{section.title}</h2>
                <p className="text-muted-foreground mb-6">{section.body}</p>
                {section.highlights.length > 0 && (
                  <ul className="space-y-2">
                    {section.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          {/* Projects Section */}
          {visibleProjects.length > 0 && (
            <section className="py-16 px-4 border-t border-border">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">Projects</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {visibleProjects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-lg border border-border bg-card p-6"
                    >
                      {project.images[0] && (
                        <div className="aspect-video rounded-md overflow-hidden mb-4 bg-muted">
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.summary}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </PublicLayout>
      </div>
    </div>
  );
};

export default PreviewSite;
