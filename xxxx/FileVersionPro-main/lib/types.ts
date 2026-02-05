export interface FileVersion {
  versionId: string;
  storagePath: string;
  size: number;
  createdAt: Date;
  uploadedBy: string;
  versionNumber: number;
  versionName: string;
}

export interface FileItem {
  fileId: string;
  name: string;
  parentFolderId: string | null;
  currentVersionId: string;
  versions: FileVersion[];
}
