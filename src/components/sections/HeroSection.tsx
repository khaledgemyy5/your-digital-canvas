import { ArrowDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionWrapper } from './SectionWrapper';

export function HeroSection() {
  const scrollToAbout = () => {
    document.querySelector('#summary')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <SectionWrapper id="hero" variant="hero" className="flex items-center">
      <div className="w-full">
        <div className="max-w-4xl stagger-children">
          {/* Greeting */}
          <p className="text-sm md:text-base font-medium text-primary mb-4 md:mb-6 tracking-wide uppercase">
            Welcome to my portfolio
          </p>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-foreground leading-tight mb-6 md:mb-8">
            I build{' '}
            <span className="text-gradient italic">
              exceptional
            </span>{' '}
            digital experiences
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 md:mb-12 leading-relaxed">
            A passionate software engineer specializing in creating elegant solutions 
            that bridge the gap between complex technical challenges and beautiful user experiences.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant="hero"
              size="lg"
              onClick={scrollToAbout}
            >
              View My Work
              <ArrowDown className="h-4 w-4" />
            </Button>

            <Button
              variant="glass"
              size="lg"
            >
              <Download className="h-4 w-4" />
              Download Resume
            </Button>
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
