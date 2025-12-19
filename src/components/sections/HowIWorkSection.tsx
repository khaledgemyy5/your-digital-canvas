import { Target, Users, Zap, RefreshCw, LucideIcon } from 'lucide-react';
import { SectionWrapper, SectionHeader } from './SectionWrapper';
import { cn } from '@/lib/utils';

interface ProcessStep {
  icon: string;
  title: string;
  description: string;
}

interface Value {
  title: string;
  subtitle: string;
}

interface HowIWorkSectionProps {
  title: string;
  subtitle?: string | null;
  content?: Record<string, unknown> | null;
}

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Target,
  Users,
  Zap,
  RefreshCw,
};

export function HowIWorkSection({ title, subtitle, content }: HowIWorkSectionProps) {
  // Extract steps and values from content
  const steps = (content?.steps as ProcessStep[]) || [];
  const values = (content?.values as Value[]) || [];

  if (steps.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="how-i-work" variant="alternate">
      <SectionHeader 
        title={title} 
        subtitle={subtitle || undefined}
        centered
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => {
          const IconComponent = iconMap[step.icon] || Target;
          
          return (
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
                <IconComponent className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-serif text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

              {/* Connector line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-border" />
              )}
            </div>
          );
        })}
      </div>

      {/* Values */}
      {values.length > 0 && (
        <div className="mt-16 md:mt-24 grid md:grid-cols-3 gap-8 text-center">
          {values.map((value, index) => (
            <div 
              key={value.title}
              className="animate-fade-in-up" 
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <p className="text-4xl font-serif text-primary mb-2">{value.title}</p>
              <p className="text-sm text-muted-foreground">{value.subtitle}</p>
            </div>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
