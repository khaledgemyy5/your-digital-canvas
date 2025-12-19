import { PublicLayout } from '@/components/layout/PublicLayout';
import { usePreviewSite } from '@/hooks/usePreviewSite';
import { DynamicSection } from '@/components/sections/DynamicSection';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Moon, Sun, X, RefreshCw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Preview Site Page (Admin Only)
 * 
 * Renders draft sections dynamically from the API.
 * Identical layout to public site, but uses draft content.
 */
const PreviewSite = () => {
  const { theme, setTheme } = useTheme();
  const { 
    isLoading, 
    error,
    refetch,
    getVisibleSections, 
    getVisibleProjects,
    getSiteSettings,
    getSocialLinks,
    getResume 
  } = usePreviewSite();

  const sections = getVisibleSections();
  const projects = getVisibleProjects();
  const siteSettings = getSiteSettings();
  const socialLinks = getSocialLinks();
  const resume = getResume();

  const handleClose = () => {
    window.close();
  };

  if (isLoading) {
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
                Loading preview...
              </span>
            </div>
          </div>
        </div>
        
        <div className="pt-10">
          <PublicLayout>
            <div className="container py-24 space-y-24">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-6">
                  <Skeleton className="h-12 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                  <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                  </div>
                </div>
              ))}
            </div>
          </PublicLayout>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Preview Banner */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/90 text-destructive-foreground px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-background/20 border-background/40">
                Preview Error
              </Badge>
              <span className="text-sm font-medium">
                Failed to load preview
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
            <div className="container py-24 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </PublicLayout>
        </div>
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
              You are viewing unpublished changes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/20"
              onClick={refetch}
              title="Refresh preview"
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
              title="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Site Content with extra top padding for banner */}
      <div className="pt-10">
        <PublicLayout>
          {sections.length === 0 ? (
            <div className="container py-24 text-center">
              <p className="text-muted-foreground">No visible sections. Add sections in the admin panel.</p>
            </div>
          ) : (
            sections.map((section) => (
              <DynamicSection
                key={section.id}
                section={section}
                projects={projects}
                siteSettings={siteSettings}
                socialLinks={socialLinks}
                resume={resume}
              />
            ))
          )}
        </PublicLayout>
      </div>
    </div>
  );
};

export default PreviewSite;
