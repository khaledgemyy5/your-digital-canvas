import { CheckCircle2 } from 'lucide-react';
import { SectionWrapper, SectionHeader } from './SectionWrapper';

const highlights = [
  '5+ years of experience in full-stack development',
  'Specialized in React, TypeScript, and cloud architecture',
  'Passionate about clean code and user-centric design',
  'Strong focus on performance and accessibility',
];

export function SummarySection() {
  return (
    <SectionWrapper id="summary">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Content */}
        <div className="animate-fade-in-up">
          <SectionHeader 
            title="About Me" 
            subtitle="A brief introduction to who I am and what I do."
          />

          <div className="prose prose-lg text-muted-foreground mb-8">
            <p>
              I'm a software engineer with a passion for building products that make a difference. 
              With a background in computer science and years of hands-on experience, I've developed 
              a deep understanding of what it takes to create software that not only works but delights users.
            </p>
            <p>
              My approach combines technical excellence with a keen eye for design, ensuring that 
              every project I work on is both functional and beautiful.
            </p>
          </div>

          {/* Highlights */}
          <ul className="space-y-3">
            {highlights.map((highlight, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 text-foreground"
              >
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual Element */}
        <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="aspect-square rounded-2xl bg-gradient-card border border-border shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-5xl font-serif text-primary">JD</span>
                </div>
                <p className="text-lg font-medium text-foreground">John Doe</p>
                <p className="text-sm text-muted-foreground">Software Engineer</p>
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
