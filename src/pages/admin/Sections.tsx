import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Edit } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  status: 'draft' | 'published';
  visible: boolean;
  order: number;
}

// Predefined sections matching user requirements
const initialSections: Section[] = [
  { id: '1', name: 'Summary', status: 'published', visible: true, order: 1 },
  { id: '2', name: 'Skills', status: 'draft', visible: true, order: 2 },
  { id: '3', name: 'Experience Overview', status: 'published', visible: true, order: 3 },
  { id: '4', name: 'How I Work', status: 'published', visible: true, order: 4 },
  { id: '5', name: 'Some Projects', status: 'draft', visible: true, order: 5 },
  { id: '6', name: 'Contact', status: 'published', visible: true, order: 6 },
];

const Sections = () => {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const toggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = sections.findIndex((s) => s.id === draggedId);
    const targetIndex = sections.findIndex((s) => s.id === targetId);

    const newSections = [...sections];
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);

    // Update order values
    const reordered = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(reordered);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Manage Sections</CardTitle>
          <CardDescription>
            Drag to reorder. Order affects public site layout. Hidden sections won't appear in navigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {sections.map((section) => (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => handleDragStart(e, section.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, section.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                  draggedId === section.id
                    ? 'bg-muted/70 opacity-50'
                    : 'hover:bg-muted/30'
                } ${!section.visible ? 'opacity-60' : ''}`}
              >
                <button
                  className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                  onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                  onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{section.name}</span>
                </div>

                <Badge
                  variant={section.status === 'published' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {section.status === 'published' ? 'Published' : 'Draft'}
                </Badge>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {section.visible ? 'Visible' : 'Hidden'}
                    </span>
                    <Switch
                      checked={section.visible}
                      onCheckedChange={() => toggleVisibility(section.id)}
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Changes are saved automatically as drafts
      </p>
    </div>
  );
};

export default Sections;
