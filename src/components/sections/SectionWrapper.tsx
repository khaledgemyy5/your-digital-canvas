import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'alternate' | 'hero';
}

export function SectionWrapper({ 
  id, 
  className, 
  children, 
  variant = 'default' 
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-24 lg:py-32',
        variant === 'alternate' && 'bg-card',
        variant === 'hero' && 'bg-gradient-hero min-h-[calc(100vh-5rem)]',
        className
      )}
    >
      <div className="container">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeader({ title, subtitle, centered = false }: SectionHeaderProps) {
  return (
    <div className={cn('mb-12 md:mb-16', centered && 'text-center')}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-muted-foreground max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
