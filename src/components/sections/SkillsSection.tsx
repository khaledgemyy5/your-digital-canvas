import { SectionWrapper, SectionHeader } from './SectionWrapper';
import { cn } from '@/lib/utils';

interface SkillCategory {
  name: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    name: 'Frontend',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    name: 'Backend',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'REST APIs', 'GraphQL'],
  },
  {
    name: 'Cloud & DevOps',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
  },
  {
    name: 'Tools & Practices',
    skills: ['Git', 'Agile', 'TDD', 'System Design', 'Performance Optimization'],
  },
];

export function SkillsSection() {
  return (
    <SectionWrapper id="skills" variant="alternate">
      <SectionHeader 
        title="Skills & Expertise" 
        subtitle="Technologies and tools I use to bring ideas to life."
        centered
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {skillCategories.map((category, categoryIndex) => (
          <div
            key={category.name}
            className={cn(
              'p-6 md:p-8 rounded-2xl bg-background border border-border',
              'transition-all duration-base hover:shadow-md hover:border-primary/20',
              'animate-fade-in-up'
            )}
            style={{ animationDelay: `${categoryIndex * 0.1}s` }}
          >
            <h3 className="text-lg font-serif text-foreground mb-4">
              {category.name}
            </h3>
            <ul className="space-y-2">
              {category.skills.map((skill) => (
                <li 
                  key={skill}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Additional skills bar */}
      <div className="mt-12 md:mt-16 pt-12 border-t border-border">
        <p className="text-center text-sm text-muted-foreground mb-6">
          Also experienced with
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Firebase', 'Redis', 'MongoDB', 'Jest', 'Cypress', 'Figma', 'Storybook', 'Webpack'].map((skill) => (
            <span
              key={skill}
              className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
