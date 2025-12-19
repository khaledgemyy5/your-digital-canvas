import { PreviewProject, PreviewSocialLink, PreviewResume } from '@/services/api/preview';
import { HeroSection } from './HeroSection';
import { SummarySection } from './SummarySection';
import { SkillsSection } from './SkillsSection';
import { ExperienceSection } from './ExperienceSection';
import { HowIWorkSection } from './HowIWorkSection';
import { ProjectsSection } from './ProjectsSection';
import { ContactSection } from './ContactSection';

interface SimpleBullet {
  id: string;
  content: string;
  display_order: number;
}

interface SimplifiedSection {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content: Record<string, unknown> | null;
  bullets: SimpleBullet[];
}

interface DynamicSectionProps {
  section: SimplifiedSection;
  projects: PreviewProject[];
  siteSettings: Record<string, unknown>;
  socialLinks: PreviewSocialLink[];
  resume?: PreviewResume;
}

/**
 * Dynamic Section Renderer
 * 
 * Routes section data to the appropriate component based on slug.
 * All content comes from the API - no hardcoded data.
 */
export function DynamicSection({ 
  section, 
  projects, 
  siteSettings, 
  socialLinks,
  resume 
}: DynamicSectionProps) {
  const { slug, title, subtitle, content } = section;

  // Route to appropriate section component based on slug
  switch (slug) {
    case 'hero':
      return (
        <HeroSection 
          title={title}
          subtitle={subtitle}
          content={content}
          resume={resume}
        />
      );

    case 'summary':
      return (
        <SummarySection 
          title={title}
          subtitle={subtitle}
          content={content}
          bullets={section.bullets}
          siteSettings={siteSettings}
        />
      );

    case 'skills':
      return (
        <SkillsSection 
          title={title}
          subtitle={subtitle}
          content={content}
        />
      );

    case 'experience':
      return (
        <ExperienceSection 
          title={title}
          subtitle={subtitle}
          content={content}
          bullets={section.bullets}
        />
      );

    case 'how-i-work':
      return (
        <HowIWorkSection 
          title={title}
          subtitle={subtitle}
          content={content}
        />
      );

    case 'projects':
      return (
        <ProjectsSection 
          title={title}
          subtitle={subtitle}
          projects={projects}
        />
      );

    case 'contact':
      return (
        <ContactSection 
          title={title}
          subtitle={subtitle}
          content={content}
          socialLinks={socialLinks}
        />
      );

    default:
      // Generic fallback for unknown section types
      return null;
  }
}
