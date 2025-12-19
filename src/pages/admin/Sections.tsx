import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit, Eye, EyeOff } from 'lucide-react';

// Mock data - will be replaced with API calls
const sections = [
  { id: '1', name: 'Summary', status: 'published', visible: true, order: 1 },
  { id: '2', name: 'Skills', status: 'draft', visible: true, order: 2 },
  { id: '3', name: 'Experience', status: 'published', visible: true, order: 3 },
  { id: '4', name: 'How I Work', status: 'published', visible: true, order: 4 },
  { id: '5', name: 'Projects', status: 'draft', visible: false, order: 5 },
  { id: '6', name: 'Contact', status: 'published', visible: true, order: 6 },
];

const Sections: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
          <p className="text-muted-foreground">
            Manage and reorder your portfolio sections.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sections</CardTitle>
          <CardDescription>
            Drag to reorder. Click edit to modify content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <button className="cursor-grab text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-5 w-5" />
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{section.name}</span>
                    <Badge variant={section.status === 'published' ? 'default' : 'secondary'}>
                      {section.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={section.visible ? 'text-primary' : 'text-muted-foreground'}
                  >
                    {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sections;
