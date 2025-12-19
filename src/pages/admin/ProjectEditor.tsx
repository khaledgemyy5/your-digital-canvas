import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Eye, RotateCcw, ExternalLink, Plus, X, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { projectsApi, type Project } from '@/services/api/projects';
import { publishApi } from '@/services/api/publish';
import { PublishConfirmDialog } from '@/components/PublishConfirmDialog';

const ProjectEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isNew = id === 'new';

  // State
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Change tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Dialog state
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Check if draft differs from published
  const hasDraftChanges = useCallback(() => {
    if (!project) return false;
    return (
      project.title_draft !== project.title_published ||
      project.description_draft !== project.description_published
    );
  }, [project]);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      if (isNew) {
        setIsLoading(false);
        setTitle('New Project');
        setSlug('new-project-' + Date.now());
        return;
      }

      if (!id) return;

      setIsLoading(true);
      setError(null);

      const result = await projectsApi.getById(id);
      
      if (result.success && result.data) {
        const p = result.data;
        setProject(p);
        setTitle(p.title_draft);
        setDescription(p.description_draft || '');
        setSlug(p.slug);
        setTechnologies(p.technologies || []);
        setThumbnailUrl(p.thumbnail_url || '');
        setGithubUrl(p.github_url || '');
        setExternalUrl(p.external_url || '');
        setIsVisible(p.is_visible);
        setIsFeatured(p.is_featured);
      } else {
        setError(result.error || 'Failed to load project');
      }
      
      setIsLoading(false);
    };

    loadProject();
  }, [id, isNew]);

  // Track changes
  useEffect(() => {
    if (isLoading || !project) {
      if (isNew) setHasChanges(true);
      return;
    }
    
    const changed = 
      title !== project.title_draft ||
      description !== (project.description_draft || '') ||
      JSON.stringify(technologies) !== JSON.stringify(project.technologies || []) ||
      thumbnailUrl !== (project.thumbnail_url || '') ||
      githubUrl !== (project.github_url || '') ||
      externalUrl !== (project.external_url || '') ||
      isVisible !== project.is_visible ||
      isFeatured !== project.is_featured;
    
    setHasChanges(changed);
  }, [title, description, technologies, thumbnailUrl, githubUrl, externalUrl, isVisible, isFeatured, project, isLoading, isNew]);

  // Auto-save draft
  const saveDraft = useCallback(async () => {
    if (!hasChanges) return;
    if (isNew && !project) {
      // Create new project
      setIsSaving(true);
      const result = await projectsApi.create({
        slug,
        title_draft: title,
        description_draft: description,
        technologies,
        thumbnail_url: thumbnailUrl || null,
        github_url: githubUrl || null,
        external_url: externalUrl || null,
        is_visible: isVisible,
        is_featured: isFeatured,
      } as Partial<Project>);

      if (result.success && result.data) {
        setProject(result.data);
        setHasChanges(false);
        setLastSaved(new Date());
        toast({ description: 'Project created', duration: 2000 });
        navigate(`/admin/projects/${result.data.id}`, { replace: true });
      } else {
        toast({ 
          title: 'Failed to create project', 
          description: result.error, 
          variant: 'destructive' 
        });
      }
      setIsSaving(false);
      return;
    }

    if (!project) return;

    setIsSaving(true);
    const result = await projectsApi.update(project.id, {
      title_draft: title,
      description_draft: description,
      technologies,
      thumbnail_url: thumbnailUrl || null,
      github_url: githubUrl || null,
      external_url: externalUrl || null,
      is_visible: isVisible,
      is_featured: isFeatured,
    } as Partial<Project>);

    if (result.success && result.data) {
      setProject(result.data);
      setHasChanges(false);
      setLastSaved(new Date());
      toast({ description: 'Draft saved', duration: 2000 });
    } else {
      toast({ 
        title: 'Failed to save draft', 
        description: result.error, 
        variant: 'destructive' 
      });
    }
    setIsSaving(false);
  }, [hasChanges, isNew, project, slug, title, description, technologies, thumbnailUrl, githubUrl, externalUrl, isVisible, isFeatured, toast, navigate]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!hasChanges) return;
    
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    autoSaveTimer.current = setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [title, description, technologies, thumbnailUrl, githubUrl, externalUrl, isVisible, isFeatured, hasChanges, saveDraft]);

  // Publish
  const handlePublish = async () => {
    // Save draft first
    await saveDraft();
    
    if (!project) return;

    setIsPublishing(true);
    const result = await publishApi.publishProject(project.id);
    setShowPublishDialog(false);

    if (result.success) {
      // Reload project to get updated published data
      const reloadResult = await projectsApi.getById(project.id);
      if (reloadResult.success && reloadResult.data) {
        setProject(reloadResult.data);
      }
      toast({ title: 'Project published', description: 'Changes are now live.' });
    } else {
      toast({ 
        title: 'Failed to publish', 
        description: result.error, 
        variant: 'destructive' 
      });
    }
    setIsPublishing(false);
  };

  // Discard changes
  const handleDiscard = async () => {
    if (!project) return;

    const result = await projectsApi.discardDraft(project.id);
    setShowDiscardDialog(false);

    if (result.success && result.data) {
      const p = result.data;
      setProject(p);
      setTitle(p.title_draft);
      setDescription(p.description_draft || '');
      setTechnologies(p.technologies || []);
      setThumbnailUrl(p.thumbnail_url || '');
      setGithubUrl(p.github_url || '');
      setExternalUrl(p.external_url || '');
      setIsVisible(p.is_visible);
      setIsFeatured(p.is_featured);
      setHasChanges(false);
      toast({ description: 'Changes discarded' });
    } else {
      toast({ 
        title: 'Failed to discard', 
        description: result.error, 
        variant: 'destructive' 
      });
    }
  };

  // Technology management
  const addTechnology = () => setTechnologies([...technologies, '']);
  const updateTechnology = (index: number, value: string) => {
    const updated = [...technologies];
    updated[index] = value;
    setTechnologies(updated);
  };
  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  // Preview
  const handlePreview = () => {
    if (project) {
      window.open(`/preview/project/${project.id}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => navigate('/admin/projects')}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{isNew ? 'New Project' : 'Edit Project'}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={project?.is_published ? 'default' : 'secondary'} className="text-xs">
                {project?.is_published ? 'Published' : 'Draft'}
              </Badge>
              {hasChanges && <span className="text-xs text-amber-600">Unsaved changes</span>}
              {isSaving && <span className="text-xs text-muted-foreground">Saving...</span>}
              {lastSaved && !hasChanges && !isSaving && (
                <span className="text-xs text-muted-foreground">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          )}
          {hasDraftChanges() && (
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
          <Button 
            size="sm" 
            onClick={() => setShowPublishDialog(true)} 
            disabled={isPublishing || isNew}
          >
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
            />
            {thumbnailUrl && (
              <div className="mt-2 aspect-video max-w-xs rounded-lg overflow-hidden bg-muted">
                <img 
                  src={thumbnailUrl} 
                  alt="Thumbnail preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technologies */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Technologies</CardTitle>
            <Button variant="outline" size="sm" onClick={addTechnology} className="h-7 text-xs">
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
                  onChange={(e) => updateTechnology(index, e.target.value)}
                  placeholder="e.g., React, Node.js"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => removeTechnology(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {technologies.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No technologies added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-muted-foreground" />
              <Input
                id="github"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external">Live Demo URL</Label>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <Input
                id="external"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
            </div>
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
              <Label>Visible</Label>
              <p className="text-xs text-muted-foreground">Show on public site</p>
            </div>
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Featured</Label>
              <p className="text-xs text-muted-foreground">Highlight on homepage</p>
            </div>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PublishConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublish}
        title="Publish Project"
        description="This will make your project visible on the public site."
        isLoading={isPublishing}
      />

      <PublishConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscard}
        title="Discard Changes"
        description="This will revert to the last published version. Unsaved changes will be lost."
        variant="discard"
      />
    </div>
  );
};

export default ProjectEditor;
