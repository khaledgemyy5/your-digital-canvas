import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Plus, X, ExternalLink, Upload, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePublishing } from '@/hooks/usePublishing';
import { PublishConfirmDialog } from '@/components/PublishConfirmDialog';
interface ProjectData {
  id: string;
  title: string;
  summary: string;
  description: string;
  role: string;
  technologies: string[];
  images: string[];
  link?: string;
  visible: boolean;
  status: 'draft' | 'published';
}

// Mock data
const mockProjects: Record<string, ProjectData> = {
  '1': {
    id: '1',
    title: 'E-Commerce Platform',
    summary: 'Full-stack online shopping solution',
    description: 'A complete e-commerce solution built with modern technologies. Features include product catalog, shopping cart, secure checkout, and order management.',
    role: 'Lead Developer - Responsible for architecture decisions, frontend development, and API design.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'],
    link: 'https://example.com',
    visible: true,
    status: 'published',
  },
  '2': {
    id: '2',
    title: 'Task Management App',
    summary: 'Collaborative project management tool',
    description: 'A real-time collaborative task management application with drag-and-drop interfaces and team collaboration features.',
    role: 'Full-stack Developer - Built real-time sync features and collaborative editing.',
    technologies: ['React', 'Firebase', 'Tailwind CSS'],
    images: [],
    link: 'https://example.com',
    visible: true,
    status: 'published',
  },
  '3': {
    id: '3',
    title: 'Portfolio Website',
    summary: 'Personal portfolio with CMS',
    description: 'A personal portfolio website with an integrated content management system for easy updates.',
    role: 'Solo Developer - Designed and built the entire application.',
    technologies: ['Next.js', 'Contentful', 'Vercel'],
    images: [],
    visible: true,
    status: 'draft',
  },
  '4': {
    id: '4',
    title: 'Analytics Dashboard',
    summary: 'Real-time data visualization',
    description: 'A dashboard for visualizing business metrics in real-time with interactive charts and customizable views.',
    role: 'Frontend Developer - Created data visualization components.',
    technologies: ['React', 'D3.js', 'WebSockets'],
    images: [],
    visible: false,
    status: 'published',
  },
};

const ProjectEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveDraft, publishItem, discardChanges, hasUnpublishedChanges, isPublishing, getDraft, getPublished } = usePublishing();

  const projectId = id || 'new';
  const isNew = !id || !mockProjects[id];

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [link, setLink] = useState('');
  const [visible, setVisible] = useState(true);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Load project data from draft first, then published, then mock
  useEffect(() => {
    const draft = getDraft<ProjectData>('project', projectId);
    const published = getPublished<ProjectData>('project', projectId);
    const mockData = id ? mockProjects[id] : null;
    
    const data = draft || published || mockData;
    
    if (data) {
      setTitle(data.title);
      setSummary(data.summary);
      setDescription(data.description);
      setRole(data.role);
      setTechnologies([...data.technologies]);
      setImages([...data.images]);
      setLink(data.link || '');
      setVisible(data.visible);
      setStatus(data.status);
    } else {
      setTitle('Untitled Project');
      setSummary('');
      setDescription('');
      setRole('');
      setTechnologies([]);
      setImages([]);
      setLink('');
      setVisible(false);
      setStatus('draft');
    }
  }, [id, projectId, getDraft, getPublished]);

  // Build current project data
  const getCurrentData = useCallback((): ProjectData => ({
    id: projectId,
    title,
    summary,
    description,
    role,
    technologies,
    images,
    link,
    visible,
    status,
  }), [projectId, title, summary, description, role, technologies, images, link, visible, status]);

  // Auto-save to draft
  const autoSave = useCallback(() => {
    if (!hasChanges) return;
    saveDraft('project', projectId, getCurrentData());
    setLastSaved(new Date());
    setHasChanges(false);
    toast({
      description: 'Draft saved automatically',
      duration: 2000,
    });
  }, [hasChanges, saveDraft, projectId, getCurrentData, toast]);

  useEffect(() => {
    if (!hasChanges) return;
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [title, summary, description, role, technologies, images, link, visible, hasChanges, autoSave]);

  useEffect(() => {
    setHasChanges(true);
  }, [title, summary, description, role, technologies, images, link, visible]);

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

  const handleAddImage = () => {
    setImages([...images, '']);
  };

  const handleUpdateImage = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    // Save draft first
    saveDraft('project', projectId, { ...getCurrentData(), status: 'published' });
    
    const result = await publishItem('project', projectId);
    setShowPublishDialog(false);
    
    if (result.success) {
      setStatus('published');
      setHasChanges(false);
      toast({
        title: 'Project published',
        description: 'Your changes are now live.',
      });
    } else {
      toast({
        title: 'Publish failed',
        description: result.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDiscard = () => {
    discardChanges('project', projectId);
    setShowDiscardDialog(false);
    
    // Reload from published version
    const published = getPublished<ProjectData>('project', projectId);
    const mockData = id ? mockProjects[id] : null;
    const data = published || mockData;
    
    if (data) {
      setTitle(data.title);
      setSummary(data.summary);
      setDescription(data.description);
      setRole(data.role);
      setTechnologies([...data.technologies]);
      setImages([...data.images]);
      setLink(data.link || '');
      setVisible(data.visible);
      setStatus(data.status);
    }
    
    setHasChanges(false);
    toast({
      description: 'Changes discarded',
    });
  };

  const handlePreview = () => {
    // Save draft before preview
    saveDraft('project', projectId, getCurrentData());
    window.open(`/preview/project/${projectId}`, '_blank');
  };

  const handlePreviewSite = () => {
    saveDraft('project', projectId, getCurrentData());
    window.open('/preview', '_blank');
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
              <Badge
                variant={status === 'published' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {status === 'published' ? 'Published' : 'Draft'}
              </Badge>
              {hasChanges && (
                <span className="text-xs text-warning">Unsaved changes</span>
              )}
              {lastSaved && !hasChanges && (
                <span className="text-xs text-muted-foreground">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          {hasUnpublishedChanges('project', projectId) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDiscardDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Discard
            </Button>
          )}
          <Button size="sm" onClick={() => setShowPublishDialog(true)} disabled={isPublishing}>
            <Upload className="h-4 w-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Short Summary</Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One-line description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed project description..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role / Responsibilities</Label>
            <Textarea
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Describe your role and responsibilities..."
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Tools & Tech Stack</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {technologies.map((tech, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={tech}
                  onChange={(e) => handleUpdateTechnology(index, e.target.value)}
                  placeholder="e.g., React, Node.js, PostgreSQL"
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
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Project Images</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddImage}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Image
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {images.map((url, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={url}
                    onChange={(e) => handleUpdateImage(index, e.target.value)}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {url && (
                  <div className="relative aspect-video w-full max-w-xs rounded-md overflow-hidden bg-muted">
                    <img
                      src={url}
                      alt={`Project image ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
            {images.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">
                No images added yet. Add image URLs to display project screenshots.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links & Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Links & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="link">Project Link</Label>
            <div className="flex items-center gap-2">
              <Input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              {link && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => window.open(link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <Label>Visibility</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Show this project on your public portfolio
              </p>
            </div>
            <Switch checked={visible} onCheckedChange={setVisible} />
          </div>
        </CardContent>
      </Card>

      {/* Publish Confirmation Dialog */}
      <PublishConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublish}
        isLoading={isPublishing}
        title={`Publish "${title}"?`}
        variant="publish"
      />

      {/* Discard Confirmation Dialog */}
      <PublishConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscard}
        title={`Discard changes to "${title}"?`}
        variant="discard"
      />
    </div>
  );
};

export default ProjectEditor;
