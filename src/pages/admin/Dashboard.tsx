import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FolderOpen, Clock, AlertCircle } from 'lucide-react';

// Mock data - will be replaced with API calls
const stats = {
  totalSections: 6,
  totalProjects: 4,
  drafts: 3,
  lastEdited: '2 hours ago',
};

const recentActivity = [
  { name: 'Summary', type: 'Section', status: 'draft', time: '2 hours ago' },
  { name: 'Portfolio Site', type: 'Project', status: 'published', time: '1 day ago' },
  { name: 'Skills', type: 'Section', status: 'draft', time: '3 days ago' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.totalSections}</p>
                <p className="text-xs text-muted-foreground">Sections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.totalProjects}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-warning/10">
                <AlertCircle className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.drafts}</p>
                <p className="text-xs text-muted-foreground">Unpublished</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{stats.lastEdited}</p>
                <p className="text-xs text-muted-foreground">Last edit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    {item.type === 'Section' ? (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.status === 'draft' && (
                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                      Draft
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{item.time}</span>
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
