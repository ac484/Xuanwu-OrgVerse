import type { FileItem, FileVersion } from '@/lib/types';

export const users = [
  { id: 'user-1', name: 'Alex Johnson' },
  { id: 'user-2', name: 'Maria Garcia' },
];

const now = new Date();

const createVersions = (
  fileId: string,
  baseName: string,
  count: number
): { versions: FileVersion[], currentVersionId: string } => {
  const versions: FileVersion[] = [];
  for (let i = 1; i <= count; i++) {
    const versionId = `${fileId}-v${i}`;
    versions.push({
      versionId,
      storagePath: `/files/${fileId}/${versionId}`,
      size: 1000000 * i + Math.random() * 500000,
      createdAt: new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000 - Math.random() * 10000000),
      uploadedBy: i % 2 === 0 ? users[0].name : users[1].name,
      versionNumber: i,
      versionName: i === 1 ? 'Initial design concepts' : `Revision ${i - 1} with feedback`,
    });
  }
  versions.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  return { versions, currentVersionId: versions[0].versionId };
};

const file1Data = createVersions('file-id-1', 'Project-Alpha-Spec.docx', 4);
const file2Data = createVersions('file-id-2', 'Q3-Marketing-Assets.zip', 2);
const file3Data = createVersions('file-id-3', 'Website-Homepage-Mockup.png', 5);
const file4Data = createVersions('file-id-4', 'Client-Feedback.txt', 1);

export const files: FileItem[] = [
  {
    fileId: 'file-id-1',
    name: 'Project-Alpha-Spec.docx',
    parentFolderId: null,
    currentVersionId: file1Data.currentVersionId,
    versions: file1Data.versions,
  },
  {
    fileId: 'file-id-2',
    name: 'Q3-Marketing-Assets.zip',
    parentFolderId: null,
    currentVersionId: file2Data.currentVersionId,
    versions: file2Data.versions,
  },
  {
    fileId: 'file-id-3',
    name: 'Website-Homepage-Mockup.png',
    parentFolderId: null,
    currentVersionId: file3Data.currentVersionId,
    versions: file3Data.versions,
  },
  {
    fileId: 'file-id-4',
    name: 'Client-Feedback.txt',
    parentFolderId: null,
    currentVersionId: file4Data.currentVersionId,
    versions: file4Data.versions,
  },
];
