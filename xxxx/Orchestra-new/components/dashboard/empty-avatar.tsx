import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyAvatarProps {
    className?: string;
}

export function EmptyAvatar({ className }: EmptyAvatarProps) {
  return (
    <div className={cn("flex h-7 w-7 items-center justify-center rounded-full bg-muted/20", className)}>
      <User className="h-4 w-4 text-muted-foreground/60" />
    </div>
  );
}
