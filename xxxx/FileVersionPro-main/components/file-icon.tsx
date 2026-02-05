import {
  File,
  FileText,
  ImageIcon,
  VideoIcon,
  FileAudio,
  ArchiveIcon,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export function getFileIcon(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return ImageIcon;
    case 'mp4':
    case 'mov':
    case 'avi':
      return VideoIcon;
    case 'mp3':
    case 'wav':
      return FileAudio;
    case 'zip':
    case 'rar':
    case '7z':
      return ArchiveIcon;
    case 'txt':
    case 'md':
    case 'doc':
    case 'docx':
    case 'pdf':
      return FileText;
    default:
      return File;
  }
}

export function FileIcon({
  fileName,
  ...props
}: { fileName:string } & LucideProps) {
  const IconComponent = getFileIcon(fileName);
  return <IconComponent {...props} />;
}
