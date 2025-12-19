import { FileText, Globe, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - will be replaced with API calls
const stats = {
  draftItems: 3,
  publishedItems: 12,
  lastPublished: "2024-01-15T14:30:00",
};

const recentlyEdited = [
  { id: 1, title: "Hero Section", type: "Section", editedAt: "2 hours ago" },
  { id: 2, title: "Portfolio Project", type: "Project", editedAt: "5 hours ago" },
  { id: 3, title: "About Me", type: "Section", editedAt: "1 day ago" },
  { id: 4, title: "Contact Info", type: "Section", editedAt: "2 days ago" },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Dashboard = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/10">
                <FileText className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.draftItems}</p>
                <p className="text-xs text-muted-foreground">Draft Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.publishedItems}</p>
                <p className="text-xs text-muted-foreground">Published Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">{formatDate(stats.lastPublished)}</p>
                <p className="text-xs text-muted-foreground">Last Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.open('/preview', '_blank')}
        >
          <FileText className="h-4 w-4" />
          Preview Draft
        </Button>
        <Button className="gap-2">
          <Globe className="h-4 w-4" />
          Publish All Changes
        </Button>
      </div>

      {/* Recently Edited */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recently Edited
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentlyEdited.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.editedAt}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
