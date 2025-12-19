import { SectionWrapper, SectionHeader } from './SectionWrapper';
import { cn } from '@/lib/utils';

interface Bullet {
  id: string;
  content: string;
  display_order: number;
}

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
}

interface ExperienceSectionProps {
  title: string;
  subtitle?: string | null;
  content?: Record<string, unknown> | null;
  bullets?: Bullet[];
}

export function ExperienceSection({ title, subtitle, content, bullets = [] }: ExperienceSectionProps) {
  // Extract experiences from content
  const experiences = (content?.experiences as ExperienceItem[]) || [];

  if (experiences.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="experience">
      <SectionHeader 
        title={title} 
        subtitle={subtitle || undefined}
      />

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

        {/* Experience items */}
        <div className="space-y-12 md:space-y-16">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className={cn(
                'relative grid md:grid-cols-2 gap-6 md:gap-12',
                'animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 w-3 h-3 bg-primary rounded-full md:-translate-x-1.5 translate-y-2 shadow-glow" />

              {/* Period - alternating sides on desktop */}
              <div className={cn(
                'pl-8 md:pl-0',
                index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:order-2 md:pl-12'
              )}>
                <span className="text-sm text-primary font-medium">{exp.period}</span>
              </div>

              {/* Content */}
              <div className={cn(
                'pl-8 md:pl-0',
                index % 2 === 0 ? 'md:pl-12' : 'md:order-1 md:pr-12 md:text-right'
              )}>
                <h3 className="text-xl font-serif text-foreground mb-1">{exp.role}</h3>
                <p className="text-muted-foreground mb-3">{exp.company}</p>
                <p className="text-sm text-muted-foreground mb-4">{exp.description}</p>
                
                <ul className={cn(
                  'space-y-2 text-sm',
                  index % 2 !== 0 && 'md:text-right'
                )}>
                  {exp.highlights.map((highlight, hIndex) => (
                    <li key={hIndex} className="text-muted-foreground">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
