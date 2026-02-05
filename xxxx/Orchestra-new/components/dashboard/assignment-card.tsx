'use client';

import { Pin, PinOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Member, Assignment } from '@/lib/types';
import { MemberAvatar } from './member-avatar';
import { cn } from '@/lib/utils';

interface AssignmentCardProps {
  assignment: Assignment;
  member: Member;
  viewMode: 'live' | 'sandbox';
  onPinToggle: (assignmentId: string) => void;
  onMemberClick: (memberId: string) => void;
}

export function AssignmentCard({
  assignment,
  member,
  viewMode,
  onPinToggle,
  onMemberClick,
}: AssignmentCardProps) {
  const isSandbox = viewMode === 'sandbox';

  return (
    <Card className="relative h-9 w-9 flex-shrink-0 rounded-full">
      {isSandbox && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-1 -top-1 z-10 h-5 w-5 rounded-full bg-background"
              onClick={(e) => {
                e.stopPropagation();
                onPinToggle(assignment.id);
              }}
            >
              {assignment.isPinned ? (
                <Pin className="h-3 w-3 text-primary" />
              ) : (
                <PinOff className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{assignment.isPinned ? 'Unpin assignment' : 'Pin assignment'}</p>
          </TooltipContent>
        </Tooltip>
      )}
      <CardContent className="flex h-full items-center justify-center p-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMemberClick(member.id);
              }}
              className={cn(
                'rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                viewMode === 'live' && 'border-2 border-background'
              )}
            >
              <MemberAvatar member={member} className="h-9 w-9" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View {member.name}'s Details</p>
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
}
