import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ProjectData {
  id: string;
  title: string;
  summary: string;
  description: string;
  technologies: string[];
  link?: string;
  visible: boolean;
  hasPublicPage: boolean;
  status: 'draft' | 'published';
}

// Mock data
const mockProjects: Record<string, ProjectData> = {
  '1': {
    id: '1',
    title: 'E-Commerce Platform',
    summary: 'Full-stack online shopping solution',
    description: 'A complete e-commerce solution built with modern technologies.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    link: 'https://example.com',
    visible: true,
    hasPublicPage: true,
    status: 'published',
  },
  '2': {
    id: '2',
    title: 'Task Management App',
    summary: 'Collaborative project management tool',
    description: 'A real-time collaborative task management application.',
    technologies: ['React', 'Firebase', 'Tailwind CSS'],
    link: 'https://example.com',
    visible: true,
    hasPublicPage: true,
    status: 'published',
  },
  '3': {
    id: '3',
    title: 'Portfolio Website',
    summary: 'Personal portfolio with CMS',
    description: 'A personal portfolio website with an integrated CMS.',
    technologies: ['Next.js', 'Contentful', 'Vercel'],
    visible: true,
    hasPublicPage: false,
    status: 'draft',
  },
  '4': {
    id: '4',
    title: 'Analytics Dashboard',
    summary: 'Real-time data visualization',
    description: 'A dashboard for visualizing business metrics in real-time.',
    technologies: ['React', 'D3.js', 'WebSockets'],
    visible: false,
    hasPublicPage: true,
    status: 'published',
  },
};

const ProjectEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isNew = !id || !mockProjects[id];

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [link, setLink] = useState('');
  const [visible, setVisible] = useState(true);
  const [hasPublicPage, setHasPublicPage] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load project data
  useEffect(() => {
    if (id && mockProjects[id]) {
      const data = mockProjects[id];
      setTitle(data.title);
      setSummary(data.summary);
      setDescription(data.description);
      setTechnologies([...data.technologies]);
      setLink(data.link || '');
      setVisible(data.visible);
      setHasPublicPage(data.hasPublicPage);
    } else {
      // New project defaults
      setTitle('Untitled Project');
      setSummary('');
      setDescription('');
      setTechnologies([]);
      setLink('');
      setVisible(false);
      setHasPublicPage(false);
    }
  }, [id]);

  // Auto-save
  const autoSave = useCallback(() => {
    if (!hasChanges) return;
    setLastSaved(new Date());
    setHasChanges(false);
    toast({
      description: 'Draft saved automatically',
      duration: 2000,
    });
  }, [hasChanges, toast]);

  useEffect(() => {
    if (!hasChanges) return;
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [title, summary, description, technologies, link, visible, hasPublicPage, hasChanges, autoSave]);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [title, summary, description, technologies, link, visible, hasPublicPage]);

  const handleAddTechnology = () => {
    setTechnologies([...technologies, '']);
  };

  const handleUpdateTechnology = (index: number, value: string) => {
    const updated = [...technologies];
    updated[index] = value;
    setTechnologies(updated);
  };

  const handleRemoveTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    toast({
      title: 'Project published',
      description: 'Your changes are now live.',
    });
    navigate('/admin/projects');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {isNew ? 'New Project' : 'Edit Project'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={hasChanges ? 'secondary' : 'default'} className="text-xs">
                {hasChanges ? 'Unsaved changes' : 'Saved'}
              </Badge>
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Last saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button size="sm" onClick={handlePublish}>
          <Save className="h-4 w-4 mr-1" />
          Publish
        </Button>
      </div>

      {/* Editor Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief one-line summary"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed project description..."
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Technologies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Technologies</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTechnology}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {technologies.map((tech, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={tech}
                    onChange={(e) => handleUpdateTechnology(index, e.target.value)}
                    placeholder="e.g., React, Node.js"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveTechnology(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {technologies.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  No technologies added yet
                </p>
              )}
            </div>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Project Link (optional)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Visibility</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Show this project on your portfolio
              </p>
            </div>
            <Switch checked={visible} onCheckedChange={setVisible} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <Label>Public Page</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create a dedicated page for this project
              </p>
            </div>
            <Switch checked={hasPublicPage} onCheckedChange={setHasPublicPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectEditor;
