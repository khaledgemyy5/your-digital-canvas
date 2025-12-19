import React, { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2, Upload, Link, Globe, Mail, FileText, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { usePublishing } from '@/hooks/usePublishing';
import { PublishConfirmDialog } from '@/components/PublishConfirmDialog';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface SiteSettings {
  siteTitle: string;
  metaDescription: string;
  contactEmail: string;
  socialLinks: SocialLink[];
  resumeType: 'upload' | 'url';
  resumeUrl: string;
  resumeFileName: string;
}

const defaultSettings: SiteSettings = {
  siteTitle: '',
  metaDescription: '',
  contactEmail: '',
  socialLinks: [],
  resumeType: 'url',
  resumeUrl: '',
  resumeFileName: '',
};

const socialPlatforms = [
  'GitHub',
  'LinkedIn',
  'Twitter',
  'Instagram',
  'YouTube',
  'Dribbble',
  'Behance',
  'Medium',
  'Dev.to',
  'Other',
];

const Settings: React.FC = () => {
  const { saveDraft: saveToStorage, publishItem, discardChanges, isPublishing, getDraft, getPublished } = usePublishing();
  
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [draftDiffersFromPublished, setDraftDiffersFromPublished] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Load draft and published settings on mount
  useEffect(() => {
    const draft = getDraft<SiteSettings>('settings', 'global');
    const published = getPublished<SiteSettings>('settings', 'global');
    
    if (draft) {
      setSettings(draft);
    } else if (published) {
      setSettings(published);
    }
    
    if (published) {
      setIsPublished(true);
      if (draft) {
        setDraftDiffersFromPublished(JSON.stringify(draft) !== JSON.stringify(published));
      }
    }
  }, [getDraft, getPublished]);

  // Auto-save draft
  const saveDraft = useCallback(() => {
    saveToStorage('settings', 'global', settings);
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    
    const published = getPublished<SiteSettings>('settings', 'global');
    if (published) {
      setDraftDiffersFromPublished(JSON.stringify(settings) !== JSON.stringify(published));
    } else {
      setDraftDiffersFromPublished(true);
    }
  }, [settings, saveToStorage, getPublished]);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const timer = setTimeout(() => {
      saveDraft();
      toast.success('Draft saved automatically');
    }, 2000);

    return () => clearTimeout(timer);
  }, [settings, hasUnsavedChanges, saveDraft]);

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handlePublish = async () => {
    // Save draft first
    saveDraft();
    
    const result = await publishItem('settings', 'global');
    setShowPublishDialog(false);
    
    if (result.success) {
      setIsPublished(true);
      setDraftDiffersFromPublished(false);
      toast.success('Settings published successfully!');
    } else {
      toast.error(result.error || 'Failed to publish settings');
    }
  };

  const handleDiscard = () => {
    discardChanges('settings', 'global');
    setShowDiscardDialog(false);
    
    // Reload from published version
    const published = getPublished<SiteSettings>('settings', 'global');
    if (published) {
      setSettings(published);
    } else {
      setSettings(defaultSettings);
    }
    
    setHasUnsavedChanges(false);
    setDraftDiffersFromPublished(false);
    toast.success('Changes discarded');
  };

  const handleSaveDraft = () => {
    saveDraft();
    toast.success('Draft saved');
  };

  // Social Links Management
  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      platform: 'GitHub',
      url: '',
    };
    updateSettings({ socialLinks: [...settings.socialLinks, newLink] });
  };

  const updateSocialLink = (id: string, field: 'platform' | 'url', value: string) => {
    const updated = settings.socialLinks.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    );
    updateSettings({ socialLinks: updated });
  };

  const removeSocialLink = (id: string) => {
    updateSettings({ socialLinks: settings.socialLinks.filter(link => link.id !== id) });
  };

  // Resume file handling (simulated - stores filename only)
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to storage and get a URL
      updateSettings({ 
        resumeFileName: file.name,
        resumeUrl: URL.createObjectURL(file), // Temporary URL for demo
      });
      toast.success(`Resume "${file.name}" selected`);
    }
  };

  const openPreview = () => {
    saveToStorage('settings', 'global', settings);
    window.open('/preview', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <div className="flex items-center gap-2 mt-1">
            {isPublished ? (
              <Badge variant="default" className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                Published
              </Badge>
            ) : (
              <Badge variant="secondary">Draft Only</Badge>
            )}
            {draftDiffersFromPublished && (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                Unpublished Changes
              </Badge>
            )}
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          {draftDiffersFromPublished && (
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
              <CardDescription>
                Basic information about your portfolio site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  placeholder="John Doe - Portfolio"
                  value={settings.siteTitle}
                  onChange={(e) => updateSettings({ siteTitle: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Displayed in the browser tab and site header
                </p>
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
                    value={settings.contactEmail}
                    onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used in the contact section and footer
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
              <CardDescription>
                Optimize how your site appears in search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="A brief description of your portfolio for search engines..."
                  value={settings.metaDescription}
                  onChange={(e) => updateSettings({ metaDescription: e.target.value })}
                  rows={3}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Recommended: 150-160 characters</span>
                  <span className={settings.metaDescription.length > 160 ? 'text-destructive' : ''}>
                    {settings.metaDescription.length}/160
                  </span>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
                <p className="text-sm font-medium text-primary">
                  {settings.siteTitle || 'Your Site Title'}
                </p>
                <p className="text-xs text-emerald-600">yoursite.com</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {settings.metaDescription || 'Your meta description will appear here...'}
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
              <CardDescription>
                Add links to your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.socialLinks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No social links added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settings.socialLinks.map((link, index) => (
                    <div key={link.id} className="flex gap-2 items-start">
                      <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-muted-foreground text-sm">
                        {index + 1}.
                      </div>
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                        className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
              <CardDescription>
                Add your resume for visitors to download
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={settings.resumeType}
                onValueChange={(value: 'upload' | 'url') => updateSettings({ resumeType: value })}
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
                    Upload file
                  </Label>
                </div>
              </RadioGroup>

              {settings.resumeType === 'url' ? (
                <div className="space-y-2">
                  <Label htmlFor="resumeUrl">Resume URL</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resumeUrl"
                      placeholder="https://drive.google.com/..."
                      className="pl-10"
                      value={settings.resumeUrl}
                      onChange={(e) => updateSettings({ resumeUrl: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Make sure the link is publicly accessible
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Upload Resume</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                      id="resume-file"
                    />
                    <label htmlFor="resume-file" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      {settings.resumeFileName ? (
                        <div>
                          <p className="font-medium text-foreground">{settings.resumeFileName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOC, DOCX (max 10MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: File uploads require backend storage to persist
                  </p>
                </div>
              )}

              {(settings.resumeUrl || settings.resumeFileName) && (
                <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-sm">
                        {settings.resumeFileName || 'External Resume'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {settings.resumeUrl}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Unsaved changes - auto-saving...
        </div>
      )}

      {/* Publish Confirmation Dialog */}
      <PublishConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublish}
        isLoading={isPublishing}
        title="Publish Settings?"
        variant="publish"
      />

      {/* Discard Confirmation Dialog */}
      <PublishConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscard}
        title="Discard Settings Changes?"
        variant="discard"
      />
    </div>
  );
};

export default Settings;
