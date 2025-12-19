import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Eye, RotateCcw, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { sectionsApi, type Section } from '@/services/api/sections';
import { publishApi } from '@/services/api/publish';
import { PublishConfirmDialog } from '@/components/PublishConfirmDialog';

const SectionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [section, setSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - content is a JSON object with flexible structure
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [bullets, setBullets] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Change tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Dialog state
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Check if draft differs from published
  const hasDraftChanges = useCallback(() => {
    if (!section) return false;
    return (
      !section.is_published ||
      JSON.stringify(section.content_draft) !== JSON.stringify(section.content_published)
    );
  }, [section]);

  // Load section data
  useEffect(() => {
    const loadSection = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      const result = await sectionsApi.getById(id);
      
      if (result.success && result.data) {
        const s = result.data;
        setSection(s);
        setTitle(s.title);
        setSubtitle(s.subtitle || '');
        
        // Extract content from draft
        const content = s.content_draft as Record<string, unknown> || {};
        setContentBody((content.body as string) || '');
        
        // Extract bullets from content
        const contentBullets = (content.bullets as string[]) || [];
        setBullets(contentBullets);
        
        setIsVisible(s.is_visible);
      } else {
        setError(result.error || 'Failed to load section');
      }
      
      setIsLoading(false);
    };

    loadSection();
  }, [id]);

  // Build content object
  const buildContent = useCallback(() => {
    return {
      body: contentBody,
      bullets: bullets.filter(b => b.trim() !== ''),
    };
  }, [contentBody, bullets]);

  // Track changes
  useEffect(() => {
    if (isLoading || !section) return;
    
    const currentContent = buildContent();
    const draftContent = section.content_draft as Record<string, unknown> || {};
    
    const changed = 
      title !== section.title ||
      subtitle !== (section.subtitle || '') ||
      JSON.stringify(currentContent) !== JSON.stringify({
        body: (draftContent.body as string) || '',
        bullets: (draftContent.bullets as string[]) || [],
      }) ||
      isVisible !== section.is_visible;
    
    setHasChanges(changed);
  }, [title, subtitle, contentBody, bullets, isVisible, section, isLoading, buildContent]);

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!hasChanges || !section) return;

    setIsSaving(true);
    const content = buildContent();
    
    const result = await sectionsApi.update(section.id, {
      title,
      subtitle: subtitle || null,
      content_draft: content,
      is_visible: isVisible,
    });

    if (result.success && result.data) {
      setSection(result.data);
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
  }, [hasChanges, section, title, subtitle, isVisible, buildContent, toast]);

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
  }, [title, subtitle, contentBody, bullets, isVisible, hasChanges, saveDraft]);

  // Publish
  const handlePublish = async () => {
    // Save draft first
    await saveDraft();
    
    if (!section) return;

    setIsPublishing(true);
    const result = await publishApi.publishSection(section.id);
    setShowPublishDialog(false);

    if (result.success) {
      // Reload section
      const reloadResult = await sectionsApi.getById(section.id);
      if (reloadResult.success && reloadResult.data) {
        setSection(reloadResult.data);
      }
      toast({ title: 'Section published', description: 'Changes are now live.' });
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
    if (!section) return;

    const result = await sectionsApi.discardDraft(section.id);
    setShowDiscardDialog(false);

    if (result.success && result.data) {
      const s = result.data;
      setSection(s);
      setTitle(s.title);
      setSubtitle(s.subtitle || '');
      
      const content = s.content_draft as Record<string, unknown> || {};
      setContentBody((content.body as string) || '');
      setBullets((content.bullets as string[]) || []);
      setIsVisible(s.is_visible);
      
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

  // Bullet management
  const addBullet = () => setBullets([...bullets, '']);
  const updateBullet = (index: number, value: string) => {
    const updated = [...bullets];
    updated[index] = value;
    setBullets(updated);
  };
  const removeBullet = (index: number) => {
    setBullets(bullets.filter((_, i) => i !== index));
  };

  // Preview
  const handlePreview = () => {
    window.open('/preview', '_blank');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="mx-auto max-w-3xl text-center py-12">
        <p className="text-destructive mb-4">{error || 'Section not found'}</p>
        <Button onClick={() => navigate('/admin/sections')}>Back to Sections</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/sections')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{section.slug}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={section.is_published ? 'default' : 'secondary'} className="text-xs">
                {section.is_published ? 'Published' : 'Draft'}
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
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
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
          <Button size="sm" onClick={() => setShowPublishDialog(true)} disabled={isPublishing}>
            <Upload className="h-4 w-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Section Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Section title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Optional subtitle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body Content</Label>
            <Textarea
              id="body"
              value={contentBody}
              onChange={(e) => setContentBody(e.target.value)}
              placeholder="Write your content here..."
              rows={8}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bullets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Key Points / Highlights</CardTitle>
            <Button variant="outline" size="sm" onClick={addBullet} className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bullets.map((bullet, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={bullet}
                  onChange={(e) => updateBullet(index, e.target.value)}
                  placeholder="Enter a key point"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => removeBullet(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {bullets.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No highlights added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Visible</Label>
              <p className="text-xs text-muted-foreground">Show on public site when published</p>
            </div>
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PublishConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublish}
        title="Publish Section"
        description="This will make your changes visible on the public site."
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

export default SectionEditor;
