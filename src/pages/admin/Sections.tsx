import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { GripVertical, Edit, AlertCircle } from 'lucide-react';
import { useSections } from '@/hooks/useSections';
import { useState } from 'react';
import { toast } from 'sonner';

const Sections = () => {
  const navigate = useNavigate();
  const { sections, isLoading, error, toggleVisibility, reorderSections } = useSections();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleToggleVisibility = async (id: string) => {
    const result = await toggleVisibility(id);
    if (result.success) {
      toast.success('Visibility updated');
    } else {
      toast.error(result.error || 'Failed to update visibility');
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = sections.findIndex((s) => s.id === draggedId);
    const targetIndex = sections.findIndex((s) => s.id === targetId);

    const newSections = [...sections];
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);

    // Create new order
    const newOrder = newSections.map((s, idx) => ({ id: s.id, display_order: idx }));
    
    const result = await reorderSections(newOrder);
    if (result.success) {
      toast.success('Order updated');
    } else {
      toast.error('Failed to update order');
    }
    
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive" />
            <p className="text-sm font-medium">Failed to load sections</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                } ${!section.is_visible ? 'opacity-60' : ''}`}
              >
                <button
                  className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                  onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                  onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{section.title}</span>
                  {section.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{section.subtitle}</p>
                  )}
                </div>

                <Badge
                  variant={section.is_published ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {section.is_published ? 'Published' : 'Draft'}
                </Badge>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {section.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                    <Switch
                      checked={section.is_visible}
                      onCheckedChange={() => handleToggleVisibility(section.id)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => navigate(`/admin/sections/${section.id}`)}
                  >
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
