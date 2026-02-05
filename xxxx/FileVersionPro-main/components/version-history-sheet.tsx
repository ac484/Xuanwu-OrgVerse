'use client';

import type { FileItem, FileVersion } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import { format } from 'date-fns';
import { History, X, RotateCcw, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as React from 'react';


interface VersionHistorySheetProps {
  file: FileItem | null;
  onClose: () => void;
  onRestore: (fileId: string, versionId: string) => Promise<void>;
  onDelete: (fileId: string, versionId: string) => Promise<void>;
}

export function VersionHistorySheet({
  file,
  onClose,
  onRestore,
  onDelete,
}: VersionHistorySheetProps) {
  const [isRestoring, setIsRestoring] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const sortedVersions = React.useMemo(() => {
    return file?.versions.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()) ?? [];
  }, [file]);
  
  const handleRestore = async (versionId: string) => {
    if(!file) return;
    setIsRestoring(versionId);
    await onRestore(file.fileId, versionId);
    setIsRestoring(null);
  };

  const handleDelete = async (versionId: string) => {
    if(!file) return;
    setIsDeleting(versionId);
    await onDelete(file.fileId, versionId);
    setIsDeleting(null);
  };

  return (
    <Sheet open={!!file} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <SheetHeader className="pr-12">
          <SheetTitle className="truncate flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </SheetTitle>
          <SheetDescription className="truncate">
            {file?.name}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4 -mr-6">
            <div className="relative flex flex-col gap-6 pl-6 before:absolute before:left-6 before:top-2 before:h-full before:w-px before:bg-border">
              {sortedVersions.map((version) => (
                <div key={version.versionId} className="relative">
                  <div className="absolute -left-9 top-1.5 h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{version.versionName}</p>
                      {file?.currentVersionId === version.versionId && (
                        <Badge variant="secondary" className="border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      v{version.versionNumber} by {version.uploadedBy}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(version.createdAt), "MMM d, yyyy 'at' h:mm a")} • {formatBytes(version.size)}
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {file?.currentVersionId !== version.versionId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version.versionId)}
                        disabled={!!isRestoring}
                      >
                         {isRestoring === version.versionId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                        Restore
                      </Button>
                    )}
                    {file?.versions.length > 1 && (
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button
                              variant="destructive"
                              size="sm"
                              disabled={!!isDeleting}
                            >
                              {isDeleting === version.versionId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure you want to delete this version?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete version {version.versionNumber} ({version.versionName}) and remove its data from our servers.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(version.versionId)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
