"use client";

import * as React from 'react';
import { useOptimistic, useState } from 'react';
import { MoreVertical, History, UploadCloud } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import type { FileItem } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VersionHistorySheet } from '@/components/version-history-sheet';
import { FileIcon } from '@/components/file-icon';
import { deleteVersion, restoreVersion } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { UploadDialog } from './upload-dialog';

type OptimisticFile = FileItem & { pending?: boolean };

export function FileBrowser({ initialFiles }: { initialFiles: FileItem[] }) {
  const [optimisticFiles, setOptimisticFiles] = useOptimistic<OptimisticFile[], FileItem[]>(
    initialFiles,
    (state, newFiles) => {
      return newFiles.map(file => {
        const oldFile = state.find(f => f.fileId === file.fileId);
        if (oldFile && JSON.stringify(oldFile) !== JSON.stringify(file)) {
          return { ...file, pending: true };
        }
        return file;
      });
    }
  );

  const [historyFile, setHistoryFile] = useState<FileItem | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    // This effect removes the pending state after a short delay
    const timers = optimisticFiles.map(file => {
      if (file.pending) {
        return setTimeout(() => {
          setOptimisticFiles(optimisticFiles.map(f => f.fileId === file.fileId ? { ...file, pending: false } : f));
        }, 500);
      }
      return null;
    });
    return () => timers.forEach(t => t && clearTimeout(t));
  }, [optimisticFiles]);


  const handleRestore = async (fileId: string, versionId: string) => {
    const originalFile = optimisticFiles.find(f => f.fileId === fileId);
    if (!originalFile) return;

    const updatedFile = { ...originalFile, currentVersionId: versionId };
    
    startTransition(async () => {
      setOptimisticFiles(optimisticFiles.map(f => f.fileId === fileId ? updatedFile : f));
      const result = await restoreVersion(fileId, versionId);
      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        setOptimisticFiles(optimisticFiles); // Revert
      } else {
         toast({
          title: 'Version Restored',
          description: `Version has been successfully restored.`,
        });
      }
    });
  };

  const [isPending, startTransition] = React.useTransition();

  if (optimisticFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 py-20 rounded-lg border-2 border-dashed border-muted bg-card text-card-foreground">
        <UploadCloud className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">No files yet</h2>
        <p className="text-muted-foreground max-w-sm">
          Get started by uploading your first file.
        </p>
        <UploadDialog>
          <Button size="lg">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Your First File
          </Button>
        </UploadDialog>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>Active Version</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticFiles.map((file) => {
              const currentVersion = file.versions.find(
                (v) => v.versionId === file.currentVersionId
              );
              if (!currentVersion) return null;

              return (
                <TableRow key={file.fileId} className={file.pending || isPending ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <FileIcon fileName={file.name} className="h-6 w-6 text-muted-foreground" />
                      <span className="truncate">{file.name}</span>
                      <Badge variant="outline">v{currentVersion.versionNumber}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{currentVersion.versionName}</span>
                       <span className="text-xs text-muted-foreground">
                        v{currentVersion.versionNumber} by {currentVersion.uploadedBy}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(currentVersion.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{formatBytes(currentVersion.size)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setHistoryFile(file)}>
                          <History className="mr-2 h-4 w-4" />
                          <span>Version History</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <VersionHistorySheet
        file={historyFile}
        onClose={() => setHistoryFile(null)}
        onRestore={handleRestore}
        onDelete={async (fileId, versionId) => {
            await deleteVersion(fileId, versionId);
            toast({
                title: 'Version Deleted',
                description: `The version has been successfully deleted.`,
            });
            setHistoryFile(prev => {
                if(!prev) return null;
                const updatedFile = { ...prev, versions: prev.versions.filter(v => v.versionId !== versionId) };
                if (updatedFile.versions.length === 0) return null;
                if(updatedFile.currentVersionId === versionId) {
                    updatedFile.currentVersionId = updatedFile.versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].versionId;
                }
                return updatedFile;
            })
        }}
      />
    </>
  );
}
