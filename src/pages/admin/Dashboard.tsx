import { useState, useEffect } from "react";
import { FileText, Globe, Clock, Calendar, Upload, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePublishing, DraftItem } from "@/hooks/usePublishing";
import { PublishConfirmDialog } from "@/components/PublishConfirmDialog";
import { toast } from "sonner";

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
  const { 
    isPublishing, 
    getUnpublishedItems, 
    publishAll, 
    publishItem,
    discardAll,
    discardChanges 
  } = usePublishing();
  
  const [unpublishedItems, setUnpublishedItems] = useState<DraftItem[]>([]);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showPublishItemDialog, setShowPublishItemDialog] = useState(false);
  const [showDiscardItemDialog, setShowDiscardItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DraftItem | null>(null);
  const [lastPublished, setLastPublished] = useState<string | null>(null);

  // Refresh unpublished items
  const refreshItems = () => {
    const items = getUnpublishedItems();
    setUnpublishedItems(items);
  };

  useEffect(() => {
    refreshItems();
    // Check localStorage for last published time
    const lastPub = localStorage.getItem('last_published_at');
    if (lastPub) setLastPublished(lastPub);
  }, []);

  const handlePublishAll = async () => {
    const result = await publishAll();
    setShowPublishDialog(false);
    
    if (result.success) {
      const now = new Date().toISOString();
      localStorage.setItem('last_published_at', now);
      setLastPublished(now);
      toast.success('All changes published successfully!', {
        icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
      });
      refreshItems();
    } else {
      toast.error(result.error || 'Failed to publish changes');
    }
  };

  const handleDiscardAll = () => {
    discardAll();
    setShowDiscardDialog(false);
    toast.success('All changes discarded');
    refreshItems();
  };

  const handlePublishItem = async () => {
    if (!selectedItem) return;
    
    const result = await publishItem(selectedItem.type, selectedItem.id);
    setShowPublishItemDialog(false);
    
    if (result.success) {
      const now = new Date().toISOString();
      localStorage.setItem('last_published_at', now);
      setLastPublished(now);
      toast.success(`${selectedItem.name} published successfully!`);
      refreshItems();
    } else {
      toast.error(result.error || 'Failed to publish');
    }
    setSelectedItem(null);
  };

  const handleDiscardItem = () => {
    if (!selectedItem) return;
    
    discardChanges(selectedItem.type, selectedItem.id);
    setShowDiscardItemDialog(false);
    toast.success(`Changes to ${selectedItem.name} discarded`);
    refreshItems();
    setSelectedItem(null);
  };

  const openPublishItemDialog = (item: DraftItem) => {
    setSelectedItem(item);
    setShowPublishItemDialog(true);
  };

  const openDiscardItemDialog = (item: DraftItem) => {
    setSelectedItem(item);
    setShowDiscardItemDialog(true);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project': return 'Project';
      case 'section': return 'Section';
      case 'settings': return 'Settings';
      default: return type;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{unpublishedItems.length}</p>
                <p className="text-xs text-muted-foreground">Unpublished Changes</p>
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
                <p className="text-2xl font-semibold">Live</p>
                <p className="text-xs text-muted-foreground">Site Status</p>
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
                <p className="text-sm font-semibold">
                  {lastPublished ? formatDate(lastPublished) : 'Never'}
                </p>
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
        <Button 
          className="gap-2"
          onClick={() => setShowPublishDialog(true)}
          disabled={unpublishedItems.length === 0 || isPublishing}
        >
          <Upload className="h-4 w-4" />
          Publish All Changes
          {unpublishedItems.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-primary-foreground/20">
              {unpublishedItems.length}
            </Badge>
          )}
        </Button>
        {unpublishedItems.length > 0 && (
          <Button 
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={() => setShowDiscardDialog(true)}
          >
            <RotateCcw className="h-4 w-4" />
            Discard All
          </Button>
        )}
      </div>

      {/* Unpublished Changes */}
      {unpublishedItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Unpublished Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {unpublishedItems.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(item.type)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => openDiscardItemDialog(item)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => openPublishItemDialog(item)}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Publish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {unpublishedItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-emerald-500/50" />
            <p className="text-sm font-medium">All changes published</p>
            <p className="text-xs text-muted-foreground mt-1">Your site is up to date</p>
          </CardContent>
        </Card>
      )}

      {/* Publish All Dialog */}
      <PublishConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublishAll}
        isLoading={isPublishing}
        itemCount={unpublishedItems.length}
        variant="publish"
      />

      {/* Discard All Dialog */}
      <PublishConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscardAll}
        itemCount={unpublishedItems.length}
        variant="discard"
      />

      {/* Publish Single Item Dialog */}
      <PublishConfirmDialog
        open={showPublishItemDialog}
        onOpenChange={setShowPublishItemDialog}
        onConfirm={handlePublishItem}
        isLoading={isPublishing}
        title={`Publish ${selectedItem?.name}?`}
        variant="publish"
      />

      {/* Discard Single Item Dialog */}
      <PublishConfirmDialog
        open={showDiscardItemDialog}
        onOpenChange={setShowDiscardItemDialog}
        onConfirm={handleDiscardItem}
        title={`Discard changes to ${selectedItem?.name}?`}
        variant="discard"
      />
    </div>
  );
};

export default Dashboard;
