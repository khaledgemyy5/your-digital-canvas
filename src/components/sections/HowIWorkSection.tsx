import { Target, Users, Zap, RefreshCw } from 'lucide-react';
import { SectionWrapper, SectionHeader } from './SectionWrapper';
import { cn } from '@/lib/utils';

interface ProcessStep {
  icon: typeof Target;
  title: string;
  description: string;
}

const processSteps: ProcessStep[] = [
  {
    icon: Target,
    title: 'Understand',
    description: 'Deep dive into requirements, user needs, and business goals to establish a clear vision.',
  },
  {
    icon: Users,
    title: 'Collaborate',
    description: 'Work closely with stakeholders through open communication and iterative feedback loops.',
  },
  {
    icon: Zap,
    title: 'Execute',
    description: 'Build with precision, focusing on clean code, performance, and maintainability.',
  },
  {
    icon: RefreshCw,
    title: 'Iterate',
    description: 'Continuously improve based on data, user feedback, and emerging best practices.',
  },
];

export function HowIWorkSection() {
  return (
    <SectionWrapper id="how-i-work" variant="alternate">
      <SectionHeader 
        title="How I Work" 
        subtitle="My approach to building great software."
        centered
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {processSteps.map((step, index) => (
          <div
            key={step.title}
            className={cn(
              'relative text-center',
              'animate-fade-in-up'
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Step number */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-6xl font-serif text-muted/50 select-none">
              {index + 1}
            </div>

            {/* Icon */}
            <div className="relative z-10 w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <step.icon className="w-7 h-7 text-primary" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-serif text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

            {/* Connector line (hidden on last item and mobile) */}
            {index < processSteps.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="mt-16 md:mt-24 grid md:grid-cols-3 gap-8 text-center">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-4xl font-serif text-primary mb-2">Quality</p>
          <p className="text-sm text-muted-foreground">over quantity, always.</p>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-4xl font-serif text-primary mb-2">Clarity</p>
          <p className="text-sm text-muted-foreground">in code and communication.</p>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-4xl font-serif text-primary mb-2">Impact</p>
          <p className="text-sm text-muted-foreground">that moves the needle.</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
