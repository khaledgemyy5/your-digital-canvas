import { PublicLayout } from '@/components/layout/PublicLayout';
import { usePublicSite } from '@/hooks/usePublicSite';
import { DynamicSection } from '@/components/sections/DynamicSection';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Public Portfolio Home Page
 * 
 * Renders published sections dynamically from the API.
 * Content is fetched via usePublicSite hook - no hardcoded data.
 */
const Index = () => {
  const { 
    isLoading, 
    error, 
    getVisibleSections, 
    getVisibleProjects,
    getSiteSettings,
    getSocialLinks,
    getResume 
  } = usePublicSite();

  const sections = getVisibleSections();
  const projects = getVisibleProjects();
  const siteSettings = getSiteSettings();
  const socialLinks = getSocialLinks();
  const resume = getResume();

  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="container py-24 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {sections.map((section) => (
        <DynamicSection
          key={section.id}
          section={section}
          projects={projects}
          siteSettings={siteSettings}
          socialLinks={socialLinks}
          resume={resume}
        />
      ))}
    </PublicLayout>
  );
};

export default Index;
