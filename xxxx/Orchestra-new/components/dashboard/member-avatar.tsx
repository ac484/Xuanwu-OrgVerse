import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Member } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MemberAvatarProps {
  member: Member;
  className?: string;
}

export function MemberAvatar({ member, className }: MemberAvatarProps) {
  return (
    <Avatar className={cn('h-7 w-7', className)}>
      <AvatarImage src={member.avatarUrl} alt={member.name} />
      <AvatarFallback>
        {member.name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </AvatarFallback>
    </Avatar>
  );
}
