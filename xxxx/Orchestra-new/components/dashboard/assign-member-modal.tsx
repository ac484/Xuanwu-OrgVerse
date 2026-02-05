'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Member, Assignments } from '@/lib/types';
import { getDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { MemberAvatar } from './member-avatar';

interface AssignMemberModalProps {
  assignmentContext: { date: string; locationId: string } | null;
  members: Member[];
  assignments: Assignments;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAssignMember: (memberId: string) => void;
  onOpenCreateMemberModal: (locationId: string) => void;
}

export function AssignMemberModal({
  assignmentContext,
  members,
  assignments,
  isOpen,
  onOpenChange,
  onAssignMember,
  onOpenCreateMemberModal,
}: AssignMemberModalProps) {
  if (!assignmentContext) {
    return null;
  }

  const dayOfWeek = getDay(new Date(assignmentContext.date));

  const availableMembers = members.filter((m) => {
    const isScheduledSameDay = assignments.some(
      (s) => s.date === assignmentContext?.date && s.memberId === m.id
    );
    const isUnavailable = m.constraints.unavailableDays.includes(dayOfWeek);
    // This check is simple, but in a real app might need to check if member is allowed to work at this location
    const isCorrectLocation = m.locationId === assignmentContext.locationId;
    return !isScheduledSameDay && !isUnavailable && isCorrectLocation;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Member</DialogTitle>
          <DialogDescription>
            Select a member to assign for {assignmentContext.date}.
          </DialogDescription>
        </DialogHeader>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            onOpenChange(false);
            onOpenCreateMemberModal(assignmentContext.locationId);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Member
        </Button>
        <Separator />

        <ScrollArea className="max-h-80">
          <div className="space-y-2 p-1">
            {availableMembers.length > 0 ? (
              availableMembers.map((member) => (
                <Button
                  key={member.id}
                  variant="outline"
                  className="h-14 w-full justify-start"
                  onClick={() => onAssignMember(member.id)}
                >
                  <MemberAvatar member={member} className="mr-4 h-10 w-10" />
                  <div className="text-left">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </Button>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No available members for this day.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
