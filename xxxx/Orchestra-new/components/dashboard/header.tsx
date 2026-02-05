'use client';

import {
  BrainCircuit,
  Loader2,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { JobStatus, Location, Member } from '@/lib/types';
import { OrchestraIcon } from '@/components/icons';

interface DashboardHeaderProps {
  viewMode: 'live' | 'sandbox';
  onViewModeChange: (mode: 'live' | 'sandbox') => void;
  onAutoSchedule: () => void;
  onPublish: () => void;
  jobStatus: JobStatus;
  currentDate: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  locations: Location[];
  selectedLocation: Location | null;
  onLocationChange: (locationId: string) => void;
  members: Member[];
}

export function DashboardHeader({
  viewMode,
  onViewModeChange,
  onAutoSchedule,
  onPublish,
  jobStatus,
  currentDate,
  onMonthChange,
  locations,
  selectedLocation,
  onLocationChange,
  members,
}: DashboardHeaderProps) {
  const isJobRunning = jobStatus === 'PENDING' || jobStatus === 'PROCESSING';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <OrchestraIcon className="size-8 text-primary" />
          <h1 className="hidden text-xl font-semibold text-primary md:block">
            Orchestra
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMonthChange('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="w-32 text-center text-lg font-semibold md:w-36 md:text-xl">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMonthChange('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="hidden flex-1 min-w-0 px-4 md:flex">
        <div className="flex w-full items-center gap-1 rounded-lg bg-muted p-1 overflow-x-auto">
          {locations.map((loc) => {
            const memberCount = members.filter(
              (m) => m.locationId === loc.id
            ).length;
            return (
              <Button
                key={loc.id}
                variant={selectedLocation?.id === loc.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onLocationChange(loc.id)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  selectedLocation?.id === loc.id ? 'shadow-sm' : ''
                }`}
              >
                {loc.name}
                <Badge
                  variant={
                    selectedLocation?.id === loc.id ? 'secondary' : 'default'
                  }
                  className="py-0.5"
                >
                  {memberCount}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="flex items-center space-x-2">
          <Label
            htmlFor="view-mode"
            className={`text-sm font-medium ${
              viewMode === 'live' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Live
          </Label>
          <Switch
            id="view-mode"
            checked={viewMode === 'sandbox'}
            onCheckedChange={(checked) =>
              onViewModeChange(checked ? 'sandbox' : 'live')
            }
            aria-label="Toggle between live and sandbox views"
          />
          <Label
            htmlFor="view-mode"
            className={`text-sm font-medium ${
              viewMode === 'sandbox' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Sandbox
          </Label>
        </div>

        {viewMode === 'sandbox' && (
          <>
            <Button
              onClick={onAutoSchedule}
              disabled={isJobRunning || !selectedLocation}
              variant="outline"
              size="sm"
            >
              {isJobRunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
              )}
              {jobStatus === 'PROCESSING' ? 'Generating...' : 'Auto-Schedule'}
            </Button>
            <Button
              onClick={onPublish}
              disabled={isJobRunning || !selectedLocation}
              variant="default"
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
