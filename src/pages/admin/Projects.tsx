import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

// Mock data - will be replaced with API calls
const projects = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    summary: 'Full-stack online shopping solution',
    status: 'published',
    visible: true,
  },
  {
    id: '2',
    title: 'Task Management App',
    summary: 'Collaborative project management tool',
    status: 'published',
    visible: true,
  },
  {
    id: '3',
    title: 'Portfolio Website',
    summary: 'Personal portfolio with CMS',
    status: 'draft',
    visible: true,
  },
  {
    id: '4',
    title: 'Analytics Dashboard',
    summary: 'Real-time data visualization',
    status: 'published',
    visible: false,
  },
];

const Projects: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your portfolio projects.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>{project.summary}</CardDescription>
                </div>
                <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={project.visible ? 'text-primary' : 'text-muted-foreground'}
                >
                  {project.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
