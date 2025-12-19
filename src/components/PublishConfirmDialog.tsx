import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Upload, Trash2 } from 'lucide-react';

interface PublishConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  itemCount?: number;
  variant?: 'publish' | 'discard';
}

export const PublishConfirmDialog: React.FC<PublishConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title,
  description,
  itemCount = 1,
  variant = 'publish',
}) => {
  const isPublish = variant === 'publish';
  
  const defaultTitle = isPublish
    ? itemCount > 1
      ? `Publish ${itemCount} Items?`
      : 'Publish Changes?'
    : itemCount > 1
      ? `Discard ${itemCount} Changes?`
      : 'Discard Changes?';

  const defaultDescription = isPublish
    ? 'Your changes will be published and visible to visitors immediately.'
    : 'This will revert to the last published version. Any unsaved changes will be lost.';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={isPublish ? '' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isPublish ? 'Publishing...' : 'Discarding...'}
              </>
            ) : (
              <>
                {isPublish ? (
                  <Upload className="h-4 w-4 mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isPublish ? 'Publish' : 'Discard'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
