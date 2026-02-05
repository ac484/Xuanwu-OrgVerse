'use server';

import { revalidatePath } from 'next/cache';
import { files as mockFiles, users } from '@/lib/mock-data';
import type { FileItem, FileVersion } from '@/lib/types';
import { generateHelpfulVersionName } from '@/ai/flows/generate-helpful-version-name';

// In a real app, you would fetch from a database.
export async function getFiles(
  parentFolderId: string | null = null
): Promise<FileItem[]> {
  return mockFiles.filter((file) => file.parentFolderId === parentFolderId);
}

export async function getFile(fileId: string): Promise<FileItem | undefined> {
  return mockFiles.find((file) => file.fileId === fileId);
}

export async function uploadFile(formData: FormData): Promise<FileItem> {
  const file = formData.get('file') as File;
  const changeDescription =
    formData.get('changeDescription') as string | 'Initial upload';

  const existingFile = mockFiles.find((f) => f.name === file.name);

  if (existingFile) {
    // Create a new version
    const newVersionNumber =
      Math.max(...existingFile.versions.map((v) => v.versionNumber)) + 1;
    
    const versionNameResponse = await generateHelpfulVersionName({
        filename: file.name,
        changeDescription: changeDescription,
        previousVersionName: existingFile.versions.sort((a,b) => b.versionNumber - a.versionNumber)[0].versionName
    });

    const newVersion: FileVersion = {
      versionId: crypto.randomUUID(),
      storagePath: `/files/${existingFile.fileId}/${crypto.randomUUID()}`,
      size: file.size,
      createdAt: new Date(),
      uploadedBy: users[0].name,
      versionNumber: newVersionNumber,
      versionName: versionNameResponse.versionName || `Version ${newVersionNumber}`,
    };

    existingFile.versions.push(newVersion);
    existingFile.currentVersionId = newVersion.versionId;
    revalidatePath('/');
    return existingFile;
  } else {
    // Create a new file
    const fileId = crypto.randomUUID();
    const versionId = crypto.randomUUID();
    
    const versionNameResponse = await generateHelpfulVersionName({
        filename: file.name,
        changeDescription: changeDescription,
    });

    const newFile: FileItem = {
      fileId,
      name: file.name,
      parentFolderId: null,
      currentVersionId: versionId,
      versions: [
        {
          versionId: versionId,
          storagePath: `/files/${fileId}/${versionId}`,
          size: file.size,
          createdAt: new Date(),
          uploadedBy: users[0].name,
          versionNumber: 1,
          versionName: versionNameResponse.versionName || 'Initial Version',
        },
      ],
    };

    mockFiles.push(newFile);
    revalidatePath('/');
    return newFile;
  }
}

export async function restoreVersion(
  fileId: string,
  versionId: string
): Promise<FileItem | { error: string }> {
  const file = mockFiles.find((f) => f.fileId === fileId);
  if (!file) {
    return { error: 'File not found' };
  }

  const version = file.versions.find((v) => v.versionId === versionId);
  if (!version) {
    return { error: 'Version not found' };
  }

  file.currentVersionId = versionId;
  revalidatePath('/');
  return file;
}

export async function deleteVersion(
  fileId: string,
  versionId: string
): Promise<FileItem | { error: string }> {
  const fileIndex = mockFiles.findIndex((f) => f.fileId === fileId);
  if (fileIndex === -1) {
    return { error: 'File not found' };
  }

  const file = mockFiles[fileIndex];

  if (file.versions.length === 1) {
    // If it's the last version, delete the whole file
    mockFiles.splice(fileIndex, 1);
    revalidatePath('/');
    // Returning a special structure to indicate deletion
    return { ...file, versions: [] };
  }

  const versionIndex = file.versions.findIndex((v) => v.versionId === versionId);
  if (versionIndex === -1) {
    return { error: 'Version not found' };
  }

  file.versions.splice(versionIndex, 1);

  // If the deleted version was the current one, set the latest as current
  if (file.currentVersionId === versionId) {
    const latestVersion = file.versions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
    file.currentVersionId = latestVersion.versionId;
  }

  revalidatePath('/');
  return file;
}
