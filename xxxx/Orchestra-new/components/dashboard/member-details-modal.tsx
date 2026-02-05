'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Member } from '@/lib/types';
import { Edit } from 'lucide-react';
import { MemberAvatar } from './member-avatar';

interface MemberDetailsModalProps {
  member: Member | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  scheduledHours: number;
  maxHoursPerMonth: number;
}

export function MemberDetailsModal({
  member,
  isOpen,
  onOpenChange,
  scheduledHours,
  maxHoursPerMonth,
}: MemberDetailsModalProps) {
  if (!member) {
    return null;
  }

  const progress =
    maxHoursPerMonth > 0 ? (scheduledHours / maxHoursPerMonth) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <MemberAvatar member={member} className="h-16 w-16" />
            <div>
              <DialogTitle className="text-2xl">{member.name}</DialogTitle>
              <DialogDescription>{member.role}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Constraints</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Max Hours/Week</p>
                <p>{member.constraints.maxHoursPerWeek}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Monthly Schedule</h4>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Scheduled Hours</span>
              <span>
                {scheduledHours} / {maxHoursPerMonth}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Constraints
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
