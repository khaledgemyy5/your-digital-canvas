import { CheckCircle2 } from 'lucide-react';
import { SectionWrapper, SectionHeader } from './SectionWrapper';

interface Bullet {
  id: string;
  content: string;
  display_order: number;
}

interface SummarySectionProps {
  title: string;
  subtitle?: string | null;
  content?: Record<string, unknown> | null;
  bullets?: Bullet[];
  siteSettings?: Record<string, unknown>;
}

export function SummarySection({ title, subtitle, content, bullets = [], siteSettings }: SummarySectionProps) {
  // Extract content fields
  const bodyText = (content?.body as string) || '';
  const paragraphs = bodyText.split('\n\n').filter(Boolean);
  
  // Get owner info from site settings
  const ownerName = (siteSettings?.owner_name as string) || '';
  const ownerTitle = (siteSettings?.owner_title as string) || '';
  const ownerInitials = ownerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Sort bullets by display_order
  const sortedBullets = [...bullets].sort((a, b) => a.display_order - b.display_order);

  return (
    <SectionWrapper id="summary">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Content */}
        <div className="animate-fade-in-up">
          <SectionHeader 
            title={title} 
            subtitle={subtitle || undefined}
          />

          <div className="prose prose-lg text-muted-foreground mb-8">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Highlights */}
          {sortedBullets.length > 0 && (
            <ul className="space-y-3">
              {sortedBullets.map((bullet) => (
                <li 
                  key={bullet.id}
                  className="flex items-start gap-3 text-foreground"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{bullet.content}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Visual Element */}
        <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="aspect-square rounded-2xl bg-gradient-card border border-border shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-5xl font-serif text-primary">
                    {ownerInitials || 'ME'}
                  </span>
                </div>
                {ownerName && (
                  <p className="text-lg font-medium text-foreground">{ownerName}</p>
                )}
                {ownerTitle && (
                  <p className="text-sm text-muted-foreground">{ownerTitle}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </SectionWrapper>
  );
}
