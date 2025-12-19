import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeroSection } from '@/components/sections/HeroSection';
import { SummarySection } from '@/components/sections/SummarySection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { HowIWorkSection } from '@/components/sections/HowIWorkSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ContactSection } from '@/components/sections/ContactSection';

/**
 * Public Portfolio Home Page
 * 
 * Displays all enabled sections in configured order.
 * Content will be fetched from the API when backend is connected.
 */
const Index = () => {
  return (
    <PublicLayout>
      <HeroSection />
      <SummarySection />
      <SkillsSection />
      <ExperienceSection />
      <HowIWorkSection />
      <ProjectsSection />
      <ContactSection />
    </PublicLayout>
  );
};

export default Index;
