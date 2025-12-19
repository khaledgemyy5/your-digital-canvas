import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Plus, Trash2, Upload, Globe, Mail, FileText, Eye, RotateCcw, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { settingsApi, type SocialLink } from '@/services/api/settings';
import { publishApi } from '@/services/api/publish';
import { PublishConfirmDialog } from '@/components/PublishConfirmDialog';

interface LocalSocialLink {
  id: string;
  platform: string;
  url: string;
  isNew?: boolean;
}

const socialPlatforms = [
  'GitHub', 'LinkedIn', 'Twitter', 'Instagram', 'YouTube',
  'Dribbble', 'Behance', 'Medium', 'Dev.to', 'Other',
];

const Settings: React.FC = () => {
  const { toast } = useToast();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form state
  const [siteTitle, setSiteTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerTitle, setOwnerTitle] = useState('');
  const [socialLinks, setSocialLinks] = useState<LocalSocialLink[]>([]);
  const [resumeType, setResumeType] = useState<'url' | 'upload'>('url');
  const [resumeUrl, setResumeUrl] = useState('');

  // Original state for comparison
  const [originalSettings, setOriginalSettings] = useState<Record<string, unknown>>({});
  const [isPublished, setIsPublished] = useState(false);

  // Change tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Dialog state
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);

      try {
        // Load site settings
        const siteResult = await settingsApi.getSiteSettings();
        if (siteResult.success && siteResult.data) {
          const data = siteResult.data;
          setSiteTitle((data.site_title?.draft as string) || '');
          setMetaDescription((data.meta_description?.draft as string) || '');
          setContactEmail((data.contact_email?.draft as string) || '');
          setOwnerName((data.owner_name?.draft as string) || '');
          setOwnerTitle((data.owner_title?.draft as string) || '');
          
          setOriginalSettings({
            site_title: (data.site_title?.draft as string) || '',
            meta_description: (data.meta_description?.draft as string) || '',
            contact_email: (data.contact_email?.draft as string) || '',
            owner_name: (data.owner_name?.draft as string) || '',
            owner_title: (data.owner_title?.draft as string) || '',
          });
          
          // Check if any are published
          setIsPublished(Object.values(data).some(v => v?.is_published));
        }

        // Load social links
        const socialResult = await settingsApi.getSocialLinks();
        if (socialResult.success && socialResult.data) {
          setSocialLinks(socialResult.data.map(link => ({
            id: link.id,
            platform: link.platform,
            url: link.url_draft || '',
          })));
        }

        // Load resume
        const resumeResult = await settingsApi.getResume();
        if (resumeResult.success && resumeResult.data) {
          const resume = resumeResult.data;
          if (resume.external_url_draft) {
            setResumeType('url');
            setResumeUrl(resume.external_url_draft);
          } else if (resume.file_url_draft) {
            setResumeType('upload');
            setResumeUrl(resume.file_url_draft);
          }
        }
      } catch (error) {
        toast({ title: 'Failed to load settings', variant: 'destructive' });
      }

      setIsLoading(false);
    };

    loadSettings();
  }, [toast]);

  // Track changes
  useEffect(() => {
    if (isLoading) return;
    
    const currentSettings = {
      site_title: siteTitle,
      meta_description: metaDescription,
      contact_email: contactEmail,
      owner_name: ownerName,
      owner_title: ownerTitle,
    };
    
    const changed = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [siteTitle, metaDescription, contactEmail, ownerName, ownerTitle, originalSettings, isLoading]);

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    
    const result = await settingsApi.updateSiteSettings({
      site_title: siteTitle,
      meta_description: metaDescription,
      contact_email: contactEmail,
      owner_name: ownerName,
      owner_title: ownerTitle,
    });

    if (result.success) {
      setOriginalSettings({
        site_title: siteTitle,
        meta_description: metaDescription,
        contact_email: contactEmail,
        owner_name: ownerName,
        owner_title: ownerTitle,
      });
      setHasChanges(false);
      setLastSaved(new Date());
      toast({ description: 'Settings saved', duration: 2000 });
    } else {
      toast({ title: 'Failed to save', description: result.error, variant: 'destructive' });
    }

    setIsSaving(false);
  }, [hasChanges, siteTitle, metaDescription, contactEmail, ownerName, ownerTitle, toast]);

  // Auto-save on changes
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
  }, [siteTitle, metaDescription, contactEmail, ownerName, ownerTitle, hasChanges, saveDraft]);

  // Publish
  const handlePublish = async () => {
    await saveDraft();

    setIsPublishing(true);
    const result = await publishApi.publishSettings();
    setShowPublishDialog(false);

    if (result.success) {
      setIsPublished(true);
      toast({ title: 'Settings published', description: 'Changes are now live.' });
    } else {
      toast({ title: 'Failed to publish', description: result.error, variant: 'destructive' });
    }
    setIsPublishing(false);
  };

  // Discard
  const handleDiscard = async () => {
    // Reload from API
    const result = await settingsApi.getSiteSettings();
    setShowDiscardDialog(false);

    if (result.success && result.data) {
      const data = result.data;
      // Revert to published values
      setSiteTitle((data.site_title?.published as string) || '');
      setMetaDescription((data.meta_description?.published as string) || '');
      setContactEmail((data.contact_email?.published as string) || '');
      setOwnerName((data.owner_name?.published as string) || '');
      setOwnerTitle((data.owner_title?.published as string) || '');
      
      // Also update originals to match
      setOriginalSettings({
        site_title: (data.site_title?.published as string) || '',
        meta_description: (data.meta_description?.published as string) || '',
        contact_email: (data.contact_email?.published as string) || '',
        owner_name: (data.owner_name?.published as string) || '',
        owner_title: (data.owner_title?.published as string) || '',
      });
      
      // Save the reverted values as new draft
      await settingsApi.updateSiteSettings({
        site_title: (data.site_title?.published as string) || '',
        meta_description: (data.meta_description?.published as string) || '',
        contact_email: (data.contact_email?.published as string) || '',
        owner_name: (data.owner_name?.published as string) || '',
        owner_title: (data.owner_title?.published as string) || '',
      });

      setHasChanges(false);
      toast({ description: 'Changes discarded' });
    }
  };

  // Social link management
  const addSocialLink = async () => {
    const result = await settingsApi.createSocialLink({
      platform: 'GitHub',
      url_draft: '',
    });

    if (result.success && result.data) {
      setSocialLinks([...socialLinks, {
        id: result.data.id,
        platform: result.data.platform,
        url: result.data.url_draft || '',
      }]);
      toast({ description: 'Social link added', duration: 2000 });
    }
  };

  const updateSocialLink = async (id: string, field: 'platform' | 'url', value: string) => {
    setSocialLinks(socialLinks.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    ));

    // Debounced save to API
    setTimeout(async () => {
      const link = socialLinks.find(l => l.id === id);
      if (link) {
        await settingsApi.updateSocialLink(id, {
          platform: field === 'platform' ? value : link.platform,
          url_draft: field === 'url' ? value : link.url,
        });
      }
    }, 1000);
  };

  const removeSocialLink = async (id: string) => {
    await settingsApi.deleteSocialLink(id);
    setSocialLinks(socialLinks.filter(link => link.id !== id));
    toast({ description: 'Social link removed', duration: 2000 });
  };

  // Resume
  const handleResumeUrlChange = async (url: string) => {
    setResumeUrl(url);
    // Save to API
    await settingsApi.updateResume({
      external_url_draft: resumeType === 'url' ? url : null,
      file_url_draft: resumeType === 'upload' ? url : null,
    });
  };

  // Preview
  const openPreview = () => {
    window.open('/preview', '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={isPublished ? 'default' : 'secondary'}>
              {isPublished ? 'Published' : 'Draft Only'}
            </Badge>
            {hasChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                Unsaved Changes
              </Badge>
            )}
            {isSaving && <span className="text-xs text-muted-foreground">Saving...</span>}
            {lastSaved && !hasChanges && !isSaving && (
              <span className="text-xs text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={saveDraft} disabled={!hasChanges || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          {isPublished && hasChanges && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDiscardDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Discard
            </Button>
          )}
          <Button onClick={() => setShowPublishDialog(true)} size="sm" disabled={isPublishing}>
            <Upload className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Information
              </CardTitle>
              <CardDescription>Basic information about your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  placeholder="John Doe - Portfolio"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Your Name</Label>
                <Input
                  id="ownerName"
                  placeholder="John Doe"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerTitle">Your Title</Label>
                <Input
                  id="ownerTitle"
                  placeholder="Software Engineer"
                  value={ownerTitle}
                  onChange={(e) => setOwnerTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="hello@example.com"
                    className="pl-10"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
              <CardDescription>Optimize how your site appears in search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="A brief description of your portfolio..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Recommended: 150-160 characters</span>
                  <span className={metaDescription.length > 160 ? 'text-destructive' : ''}>
                    {metaDescription.length}/160
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
                <p className="text-sm font-medium text-primary">
                  {siteTitle || 'Your Site Title'}
                </p>
                <p className="text-xs text-emerald-600">yoursite.com</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {metaDescription || 'Your meta description will appear here...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Add links to your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No social links added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {socialLinks.map((link, index) => (
                    <div key={link.id} className="flex gap-2 items-start">
                      <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-muted-foreground text-sm">
                        {index + 1}.
                      </div>
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                        className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {socialPlatforms.map(platform => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocialLink(link.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" onClick={addSocialLink} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Social Link
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resume Tab */}
        <TabsContent value="resume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume / CV
              </CardTitle>
              <CardDescription>Add your resume for visitors to download</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={resumeType}
                onValueChange={(value: 'url' | 'upload') => setResumeType(value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="url" id="resume-url" />
                  <Label htmlFor="resume-url" className="font-normal cursor-pointer">
                    External URL (Google Drive, Dropbox, etc.)
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="upload" id="resume-upload" />
                  <Label htmlFor="resume-upload" className="font-normal cursor-pointer">
                    Direct URL to PDF
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="resumeUrl"
                    placeholder="https://..."
                    className="pl-10"
                    value={resumeUrl}
                    onChange={(e) => handleResumeUrlChange(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Make sure the link is publicly accessible
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PublishConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublish}
        title="Publish Settings"
        description="This will make your settings changes live on the public site."
        isLoading={isPublishing}
      />

      <PublishConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscard}
        title="Discard Changes"
        description="This will revert to the last published settings. Unsaved changes will be lost."
        variant="discard"
      />
    </div>
  );
};

export default Settings;
