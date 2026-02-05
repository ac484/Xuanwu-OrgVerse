'use client';

import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
} from 'date-fns';
import { Plus } from 'lucide-react';

import type { Member, Assignments, Location, Assignment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AssignmentCard } from './assignment-card';
import { AddAssignmentCard } from './add-assignment-card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CalendarViewProps {
  assignments: Assignments;
  members: Member[];
  locations: Location[];
  viewMode: 'live' | 'sandbox';
  onPinToggle: (assignmentId: string) => void;
  onMemberClick: (memberId: string) => void;
  currentDate: Date;
  onAddMemberClick: (context: { date: string; locationId: string }) => void;
  onNewLocationClick: () => void;
}

const DAYS_OF_WEEK_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarView({
  assignments,
  members,
  locations,
  viewMode,
  onPinToggle,
  onMemberClick,
  currentDate,
  onAddMemberClick,
  onNewLocationClick,
}: CalendarViewProps) {
  const assignmentsMap = useMemo(() => {
    const map = new Map<string, Record<string, Assignments>>();
    assignments.forEach((assignment) => {
      const dateKey = assignment.date;
      const dayData = map.get(dateKey) || {};
      const locationAssignments = dayData[assignment.locationId] || [];
      locationAssignments.push(assignment);
      dayData[assignment.locationId] = locationAssignments;
      map.set(dateKey, dayData);
    });
    return map;
  }, [assignments]);

  const firstDayOfMonth = startOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: endOfMonth(currentDate),
  });
  const startingDayIndex = getDay(firstDayOfMonth);
  const totalCells =
    Math.ceil((startingDayIndex + daysInMonth.length) / 7) * 7;

  return (
    <div className="grid grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))] gap-px overflow-hidden rounded-lg border bg-border">
      {DAYS_OF_WEEK_SHORT.map((day) => (
        <div
          key={day}
          className="bg-card p-2 text-center text-sm font-semibold"
        >
          {day}
        </div>
      ))}

      {Array.from({ length: startingDayIndex }).map((_, i) => (
        <div key={`pad-start-${i}`} className="bg-muted/50" />
      ))}

      {daysInMonth.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const assignmentsByLocation = assignmentsMap.get(dateKey) || {};

        return (
          <div
            key={dateKey}
            className={cn('flex min-h-[220px] flex-col gap-1.5 bg-card p-1.5')}
          >
            <ScrollArea className="flex-grow">
              <div className="flex flex-col gap-2 pr-3">
                {locations.map((location) => {
                  const locationAssignments =
                    assignmentsByLocation[location.id] || [];

                  return (
                    <div key={location.id} className="space-y-1">
                      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                          {locationAssignments.length}
                        </div>
                        <p className="truncate text-xs font-bold text-muted-foreground">
                          {location.name}
                        </p>
                      </div>
                      <div
                        className={cn('flex flex-wrap items-center', {
                          'gap-1': viewMode === 'sandbox',
                          '-space-x-2': viewMode === 'live',
                        })}
                      >
                        {locationAssignments.map((assignment) => {
                          const member = members.find(
                            (m) => m.id === assignment.memberId
                          );
                          if (!member) return null;
                          return (
                            <AssignmentCard
                              key={assignment.id}
                              assignment={assignment}
                              member={member}
                              viewMode={viewMode}
                              onPinToggle={onPinToggle}
                              onMemberClick={onMemberClick}
                            />
                          );
                        })}
                        {viewMode === 'sandbox' && (
                          <AddAssignmentCard
                            onClick={() =>
                              onAddMemberClick({
                                date: dateKey,
                                locationId: location.id,
                              })
                            }
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-1 h-8 w-8 self-start text-muted-foreground"
                      onClick={onNewLocationClick}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>New Location</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </ScrollArea>
            <div className="flex justify-end">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-sm',
                  isToday(day) && 'bg-primary font-bold text-primary-foreground'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          </div>
        );
      })}

      {Array.from({
        length: totalCells - daysInMonth.length - startingDayIndex,
      }).map((_, i) => (
        <div key={`pad-end-${i}`} className="bg-muted/50" />
      ))}
    </div>
  );
}
