import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FolderOpen, Clock, CheckCircle } from 'lucide-react';

// Mock data - will be replaced with API calls
const stats = {
  draftSections: 2,
  publishedSections: 4,
  draftProjects: 1,
  publishedProjects: 3,
  lastEdited: [
    { type: 'Section', name: 'Summary', editedAt: '2 hours ago' },
    { type: 'Project', name: 'Portfolio Site', editedAt: '1 day ago' },
    { type: 'Section', name: 'Skills', editedAt: '3 days ago' },
  ],
};

const StatCard: React.FC<{
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  variant?: 'default' | 'warning';
}> = ({ title, value, description, icon, variant = 'default' }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={variant === 'warning' ? 'text-warning' : 'text-primary'}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your portfolio content and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Draft Sections"
          value={stats.draftSections}
          description="Unpublished changes"
          icon={<FileText className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Published Sections"
          value={stats.publishedSections}
          description="Live on site"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Draft Projects"
          value={stats.draftProjects}
          description="Unpublished changes"
          icon={<FolderOpen className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Published Projects"
          value={stats.publishedProjects}
          description="Live on site"
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest edits and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.lastEdited.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {item.type === 'Section' ? (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {item.editedAt}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
