import { SectionWrapper, SectionHeader } from './SectionWrapper';
import { cn } from '@/lib/utils';

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
}

const experiences: ExperienceItem[] = [
  {
    role: 'Senior Software Engineer',
    company: 'Tech Company',
    period: '2022 - Present',
    description: 'Leading development of customer-facing applications and internal tooling.',
    highlights: [
      'Architected and implemented a microservices platform serving 1M+ users',
      'Reduced page load times by 60% through optimization strategies',
      'Mentored junior developers and established coding standards',
    ],
  },
  {
    role: 'Full Stack Developer',
    company: 'Startup Inc',
    period: '2020 - 2022',
    description: 'Built and scaled core product features from MVP to production.',
    highlights: [
      'Developed RESTful APIs handling 10K+ requests per minute',
      'Implemented real-time collaboration features using WebSockets',
      'Designed and built the company\'s design system',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'Agency Co',
    period: '2018 - 2020',
    description: 'Delivered custom web solutions for enterprise clients.',
    highlights: [
      'Built responsive web applications for Fortune 500 clients',
      'Integrated third-party APIs and payment systems',
      'Improved deployment processes, reducing release time by 40%',
    ],
  },
];

export function ExperienceSection() {
  return (
    <SectionWrapper id="experience">
      <SectionHeader 
        title="Experience" 
        subtitle="My professional journey and key accomplishments."
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
