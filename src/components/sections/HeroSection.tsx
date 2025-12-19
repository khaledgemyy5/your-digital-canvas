import { ArrowDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionWrapper } from './SectionWrapper';
import { PreviewResume } from '@/services/api/preview';

interface HeroSectionProps {
  title: string;
  subtitle?: string | null;
  content?: Record<string, unknown> | null;
  resume?: PreviewResume;
}

export function HeroSection({ title, subtitle, content, resume }: HeroSectionProps) {
  const scrollToAbout = () => {
    document.querySelector('#summary')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Extract content fields with fallbacks
  const greeting = (content?.greeting as string) || '';
  const description = (content?.description as string) || '';
  const ctaText = (content?.cta_text as string) || 'View My Work';

  return (
    <SectionWrapper id="hero" variant="hero" className="flex items-center">
      <div className="w-full">
        <div className="max-w-4xl stagger-children">
          {/* Greeting */}
          {greeting && (
            <p className="text-sm md:text-base font-medium text-primary mb-4 md:mb-6 tracking-wide uppercase">
              {greeting}
            </p>
          )}

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-foreground leading-tight mb-6 md:mb-8">
            {title}
          </h1>

          {/* Description */}
          {(subtitle || description) && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 md:mb-12 leading-relaxed">
              {description || subtitle}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant="hero"
              size="lg"
              onClick={scrollToAbout}
            >
              {ctaText}
              <ArrowDown className="h-4 w-4" />
            </Button>

            {resume?.file_url && (
              <Button
                variant="glass"
                size="lg"
                asChild
              >
                <a href={resume.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Download Resume
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground animate-fade-in" style={{ animationDelay: '1s' }}>
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground to-transparent" />
        </div>
      </div>
    </SectionWrapper>
  );
}
