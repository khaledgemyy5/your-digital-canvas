import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SectionData {
  id: string;
  name: string;
  title: string;
  body: string;
  highlights: string[];
  visible: boolean;
  status: 'draft' | 'published';
  publishedVersion?: {
    title: string;
    body: string;
    highlights: string[];
    visible: boolean;
  };
}

// Mock data - will be replaced with API calls
const mockSections: Record<string, SectionData> = {
  '1': {
    id: '1',
    name: 'Summary',
    title: 'About Me',
    body: 'I am a passionate developer with experience in building modern web applications.',
    highlights: ['10+ years experience', 'Full-stack development', 'Team leadership'],
    visible: true,
    status: 'published',
    publishedVersion: {
      title: 'About Me',
      body: 'I am a passionate developer with experience in building modern web applications.',
      highlights: ['10+ years experience', 'Full-stack development', 'Team leadership'],
      visible: true,
    },
  },
  '2': {
    id: '2',
    name: 'Skills',
    title: 'Technical Skills',
    body: 'Proficient in a wide range of technologies and frameworks.',
    highlights: ['React & TypeScript', 'Node.js & Python', 'Cloud Architecture'],
    visible: true,
    status: 'draft',
  },
  '3': {
    id: '3',
    name: 'Experience Overview',
    title: 'Professional Experience',
    body: 'Over a decade of experience working with startups and enterprises.',
    highlights: ['Led teams of 5-20 engineers', 'Shipped products to millions of users'],
    visible: true,
    status: 'published',
    publishedVersion: {
      title: 'Professional Experience',
      body: 'Over a decade of experience working with startups and enterprises.',
      highlights: ['Led teams of 5-20 engineers', 'Shipped products to millions of users'],
      visible: true,
    },
  },
  '4': {
    id: '4',
    name: 'How I Work',
    title: 'My Approach',
    body: 'I believe in iterative development and close collaboration with stakeholders.',
    highlights: ['Agile methodology', 'User-centered design', 'Continuous delivery'],
    visible: true,
    status: 'published',
    publishedVersion: {
      title: 'My Approach',
      body: 'I believe in iterative development and close collaboration with stakeholders.',
      highlights: ['Agile methodology', 'User-centered design', 'Continuous delivery'],
      visible: true,
    },
  },
  '5': {
    id: '5',
    name: 'Some Projects',
    title: 'Featured Projects',
    body: 'A selection of projects I have worked on.',
    highlights: ['E-commerce platforms', 'SaaS applications', 'Mobile apps'],
    visible: true,
    status: 'draft',
  },
  '6': {
    id: '6',
    name: 'Contact',
    title: 'Get in Touch',
    body: 'I am always open to discussing new opportunities and collaborations.',
    highlights: ['Available for freelance', 'Open to full-time roles', 'Remote preferred'],
    visible: true,
    status: 'published',
    publishedVersion: {
      title: 'Get in Touch',
      body: 'I am always open to discussing new opportunities and collaborations.',
      highlights: ['Available for freelance', 'Open to full-time roles', 'Remote preferred'],
      visible: true,
    },
  },
};

const SectionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [section, setSection] = useState<SectionData | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load section data
  useEffect(() => {
    if (id && mockSections[id]) {
      const data = mockSections[id];
      setSection(data);
      setTitle(data.title);
      setBody(data.body);
      setHighlights([...data.highlights]);
      setVisible(data.visible);
    }
  }, [id]);

  // Auto-save as draft (debounced)
  const autoSave = useCallback(() => {
    if (!hasChanges) return;
    // Simulate save
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
  }, [title, body, highlights, visible, hasChanges, autoSave]);

  // Track changes
  useEffect(() => {
    if (!section) return;
    const changed =
      title !== section.title ||
      body !== section.body ||
      visible !== section.visible ||
      JSON.stringify(highlights) !== JSON.stringify(section.highlights);
    setHasChanges(changed);
  }, [title, body, highlights, visible, section]);

  const handleAddHighlight = () => {
    setHighlights([...highlights, '']);
  };

  const handleUpdateHighlight = (index: number, value: string) => {
    const updated = [...highlights];
    updated[index] = value;
    setHighlights(updated);
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    toast({
      title: 'Section published',
      description: 'Your changes are now live.',
    });
    navigate('/admin/sections');
  };

  const handleDiscard = () => {
    if (!section?.publishedVersion) {
      toast({
        title: 'No published version',
        description: 'This section has never been published.',
        variant: 'destructive',
      });
      return;
    }
    const pub = section.publishedVersion;
    setTitle(pub.title);
    setBody(pub.body);
    setHighlights([...pub.highlights]);
    setVisible(pub.visible);
    setHasChanges(false);
    toast({
      description: 'Reverted to published version',
    });
  };

  if (!section) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Section not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/sections')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{section.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={hasChanges ? 'secondary' : 'default'} className="text-xs">
                {hasChanges ? 'Unsaved changes' : section.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Last saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {section.publishedVersion && (
            <Button variant="ghost" size="sm" onClick={handleDiscard}>
              <Trash2 className="h-4 w-4 mr-1" />
              Discard
            </Button>
          )}
          <Button size="sm" onClick={handlePublish}>
            <Save className="h-4 w-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>

      {/* Editor Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Section Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Section Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter section title"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Main Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your section content..."
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Highlights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Key Highlights</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddHighlight}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={highlight}
                    onChange={(e) => handleUpdateHighlight(index, e.target.value)}
                    placeholder="Enter a key point"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveHighlight(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {highlights.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  No highlights added yet
                </p>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <Label>Visibility</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hidden sections won't appear on the public site
              </p>
            </div>
            <Switch checked={visible} onCheckedChange={setVisible} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionEditor;
