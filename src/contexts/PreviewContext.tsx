import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SectionDraft {
  id: string;
  name: string;
  title: string;
  body: string;
  highlights: string[];
  visible: boolean;
  order: number;
}

interface ProjectDraft {
  id: string;
  title: string;
  summary: string;
  description: string;
  role: string;
  technologies: string[];
  images: string[];
  link?: string;
  visible: boolean;
}

interface PreviewData {
  sections: SectionDraft[];
  projects: ProjectDraft[];
  isDraft: boolean;
}

interface PreviewContextType {
  previewData: PreviewData | null;
  setPreviewData: (data: PreviewData | null) => void;
  isPreviewMode: boolean;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

// Mock draft data - would come from admin state/localStorage in real implementation
const mockDraftSections: SectionDraft[] = [
  { id: '1', name: 'Summary', title: 'About Me', body: 'I am a passionate developer with experience in building modern web applications. This is draft content with unpublished changes.', highlights: ['10+ years experience', 'Full-stack development', 'Team leadership'], visible: true, order: 1 },
  { id: '2', name: 'Skills', title: 'Technical Skills', body: 'Proficient in a wide range of technologies and frameworks.', highlights: ['React & TypeScript', 'Node.js & Python', 'Cloud Architecture'], visible: true, order: 2 },
  { id: '3', name: 'Experience Overview', title: 'Professional Experience', body: 'Over a decade of experience working with startups and enterprises.', highlights: ['Led teams of 5-20 engineers', 'Shipped products to millions'], visible: true, order: 3 },
  { id: '4', name: 'How I Work', title: 'My Approach', body: 'I believe in iterative development and close collaboration.', highlights: ['Agile methodology', 'User-centered design'], visible: true, order: 4 },
  { id: '5', name: 'Some Projects', title: 'Featured Projects', body: 'A selection of projects I have worked on.', highlights: ['E-commerce', 'SaaS', 'Mobile'], visible: true, order: 5 },
  { id: '6', name: 'Contact', title: 'Get in Touch', body: 'Always open to discussing new opportunities.', highlights: ['Freelance available', 'Remote preferred'], visible: true, order: 6 },
];

const mockDraftProjects: ProjectDraft[] = [
  { id: '1', title: 'E-Commerce Platform', summary: 'Full-stack online shopping solution', description: 'A complete e-commerce solution built with modern technologies.', role: 'Lead Developer', technologies: ['React', 'Node.js', 'PostgreSQL'], images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'], link: 'https://example.com', visible: true },
  { id: '2', title: 'Task Management App', summary: 'Collaborative project management tool', description: 'Real-time collaborative task management.', role: 'Full-stack Developer', technologies: ['React', 'Firebase'], images: [], visible: true },
  { id: '3', title: 'Portfolio Website', summary: 'Personal portfolio with CMS', description: 'A portfolio with integrated CMS.', role: 'Solo Developer', technologies: ['Next.js', 'Vercel'], images: [], visible: true },
];

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const isPreviewMode = previewData !== null;

  return (
    <PreviewContext.Provider value={{ previewData, setPreviewData, isPreviewMode }}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within PreviewProvider');
  }
  return context;
}

// Helper to load draft data (simulated - would use localStorage or state management)
export function loadDraftData(): PreviewData {
  return {
    sections: mockDraftSections,
    projects: mockDraftProjects,
    isDraft: true,
  };
}

export function getDraftSection(id: string): SectionDraft | undefined {
  return mockDraftSections.find(s => s.id === id);
}

export function getDraftProject(id: string): ProjectDraft | undefined {
  return mockDraftProjects.find(p => p.id === id);
}
