'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { addMonths, subMonths, isSameMonth } from 'date-fns';
import { Info, Plus, PlusCircle } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useScheduleData } from '@/hooks/use-dashboard-state';
import { useAiScheduler } from '@/hooks/use-ai-scheduler';
import {
  createLocation,
  createMember,
  assignMember,
  publishSandboxChanges,
  processAiGeneratedAssignments,
} from '@/lib/schedule-logic';
import type { Member, Location } from '@/lib/types';
import type { MemberFormValues } from '@/components/dashboard/create-member-modal';

import { DashboardHeader } from '@/components/dashboard/header';
import { CalendarView } from '@/components/dashboard/calendar-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MemberDetailsModal } from '@/components/dashboard/member-details-modal';
import { AssignMemberModal } from '@/components/dashboard/assign-member-modal';
import { CreateMemberModal } from '@/components/dashboard/create-member-modal';
import { CreateLocationModal } from '@/components/dashboard/create-location-modal';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * Main dashboard page component.
 * This component is the "assembler" or "orchestrator". It is responsible for:
 * 1. Managing UI state (e.g., modals, selected items).
 * 2. Fetching and holding application data using hooks (`useScheduleData`, `useAiScheduler`).
 * 3. Handling user interactions (e.g., button clicks) and calling the appropriate
 *    business logic functions or state updates in response.
 */
export default function DashboardPage() {
  const { toast } = useToast();

  const {
    members,
    setMembers,
    locations,
    setLocations,
    liveAssignments,
    setLiveAssignments,
    sandboxAssignments,
    setSandboxAssignments,
  } = useScheduleData();

  const [viewMode, setViewMode] = useState<'live' | 'sandbox'>('live');
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6, 15));
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [assignmentContext, setAssignmentContext] = useState<{
    date: string;
    locationId: string;
  } | null>(null);
  const [isCreateMemberModalOpen, setCreateMemberModalOpen] = useState(false);
  const [locationToCreateIn, setLocationToCreateIn] = useState<string | null>(
    null
  );
  const [isCreateLocationModalOpen, setCreateLocationModalOpen] =
    useState(false);

  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0]);
    } else if (locations.length > 0 && selectedLocation) {
      // If a location is deleted, make sure the selected location is still valid
      if (!locations.find((l) => l.id === selectedLocation.id)) {
        setSelectedLocation(locations[0] || null);
      }
    } else if (locations.length === 0) {
      setSelectedLocation(null);
    }
  }, [locations, selectedLocation]);

  const {
    jobStatus,
    aiSummary,
    clearSummary,
    generateScheduleDraft,
    generateScheduleSummary,
  } = useAiScheduler(currentDate, selectedLocation, members);

  const assignmentsForCalendarView = useMemo(() => {
    return viewMode === 'live' ? liveAssignments : sandboxAssignments;
  }, [viewMode, liveAssignments, sandboxAssignments]);

  const { scheduledHours, maxHoursPerMonth } = useMemo(() => {
    if (!selectedMember) return { scheduledHours: 0, maxHoursPerMonth: 0 };
    const sourceAssignments =
      viewMode === 'live' ? liveAssignments : sandboxAssignments;
    const scheduledAssignments = sourceAssignments.filter(
      (assignment) =>
        assignment.memberId === selectedMember.id &&
        isSameMonth(new Date(assignment.date), currentDate)
    );
    const scheduledHours = scheduledAssignments.length * 8; // Assuming 8-hour shifts
    const maxHoursPerMonth = selectedMember.constraints.maxHoursPerWeek * 4; // Approximation
    return { scheduledHours, maxHoursPerMonth };
  }, [selectedMember, viewMode, liveAssignments, sandboxAssignments, currentDate]);

  const handleViewModeChange = (mode: 'live' | 'sandbox') => setViewMode(mode);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate((current) =>
      direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1)
    );
  };

  const handleLocationChange = (locationId: string) => {
    const newLocation = locations.find((loc) => loc.id === locationId);
    if (newLocation) setSelectedLocation(newLocation);
  };

  const handleMemberClick = useCallback(
    (memberId: string) => {
      const member = members.find((m) => m.id === memberId);
      if (member) setSelectedMember(member);
    },
    [members]
  );

  const handlePublish = useCallback(() => {
    if (viewMode !== 'sandbox' || !selectedLocation) return;

    // 1. Calculate the new state using a pure function
    const newLiveAssignments = publishSandboxChanges(
      liveAssignments,
      sandboxAssignments,
      currentDate,
      selectedLocation.id
    );

    // 2. Update the application state
    setLiveAssignments(newLiveAssignments);
    setSandboxAssignments(newLiveAssignments); // Sync sandbox with live after publish

    // 3. Handle UI side-effects
    toast({
      title: 'Schedule Published!',
      description: `The new schedule for ${selectedLocation.name} is now live.`,
    });
    setViewMode('live');
  }, [
    viewMode,
    currentDate,
    selectedLocation,
    liveAssignments,
    sandboxAssignments,
    setLiveAssignments,
    setSandboxAssignments,
    toast,
  ]);

  const handlePinToggle = useCallback(
    (assignmentId: string) => {
      setSandboxAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId
            ? { ...assignment, isPinned: !assignment.isPinned }
            : assignment
        )
      );
    },
    [setSandboxAssignments]
  );

  const handleOpenAssignModal = useCallback(
    (context: { date: string; locationId: string }) => {
      if (viewMode !== 'sandbox') {
        toast({
          variant: 'destructive',
          title: 'Live Mode',
          description: 'You can only edit schedules in Sandbox mode.',
        });
        return;
      }
      setAssignmentContext(context);
    },
    [viewMode, toast]
  );

  const handleAssignMember = useCallback(
    (memberId: string) => {
      if (!assignmentContext || viewMode !== 'sandbox') return;
      const updatedAssignments = assignMember(
        sandboxAssignments,
        assignmentContext,
        memberId
      );
      if (updatedAssignments) {
        setSandboxAssignments(updatedAssignments);
      } else {
        toast({
          variant: 'destructive',
          title: 'Scheduling Conflict',
          description: 'This member is already scheduled for another shift on this day.',
        });
      }
      setAssignmentContext(null);
    },
    [assignmentContext, viewMode, sandboxAssignments, setSandboxAssignments, toast]
  );

  const handleOpenCreateMemberModal = useCallback((locationId: string) => {
    setLocationToCreateIn(locationId);
    setCreateMemberModalOpen(true);
  }, []);

  const handleCreateMember = useCallback(
    (data: MemberFormValues) => {
      if (!locationToCreateIn) return;
      const newMember = createMember(data, locationToCreateIn);
      setMembers((prev) => [...prev, newMember]);
      setCreateMemberModalOpen(false);
      setLocationToCreateIn(null);
      toast({
        title: 'Member Created',
        description: `${newMember.name} has been added.`,
      });
    },
    [locationToCreateIn, setMembers, toast]
  );

  const handleOpenCreateLocationModal = useCallback(
    () => setCreateLocationModalOpen(true),
    []
  );

  const handleCreateLocation = useCallback(
    (name: string) => {
      const newLocation = createLocation(name);
      setLocations((prev) => [...prev, newLocation]);
      setCreateLocationModalOpen(false);
      toast({
        title: 'Location Created',
        description: `${name} has been added.`,
      });
    },
    [setLocations, toast]
  );

  /**
   * Orchestrates the entire AI auto-scheduling process.
   */
  const triggerAutoSchedule = async () => {
    if (!selectedLocation) return;
    // 1. Call the AI to get a draft
    const aiOutput = await generateScheduleDraft(sandboxAssignments);
    if (aiOutput) {
      // 2. Process the draft using pure business logic
      const newAssignments = processAiGeneratedAssignments(
        aiOutput,
        sandboxAssignments,
        selectedLocation.id,
        currentDate
      );
      // 3. Update the application state
      setSandboxAssignments(newAssignments);
      // 4. Trigger the secondary AI analysis
      await generateScheduleSummary(newAssignments);
    }
  };

  useEffect(() => {
    if (viewMode !== 'sandbox') {
      clearSummary();
    }
  }, [viewMode, clearSummary]);

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col">
        <DashboardHeader
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onAutoSchedule={triggerAutoSchedule}
          onPublish={handlePublish}
          jobStatus={jobStatus}
          currentDate={currentDate}
          onMonthChange={handleMonthChange}
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
          members={members}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {aiSummary && viewMode === 'sandbox' && (
              <Alert className="mb-6 border-primary/20 bg-primary/5">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="font-bold text-primary">
                  AI Analysis
                </AlertTitle>
                <AlertDescription>
                  <p className="mt-2 font-semibold">Summary:</p>
                  <p>{aiSummary.summary}</p>
                  <p className="mt-2 font-semibold">Insights:</p>
                  <p>{aiSummary.insights}</p>
                </AlertDescription>
              </Alert>
            )}

            {!selectedLocation ? (
              <div className="flex h-[60vh] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed">
                <h2 className="text-xl font-semibold">No Locations Created</h2>
                <p className="text-muted-foreground">
                  Get started by creating your first location.
                </p>
                <Button onClick={handleOpenCreateLocationModal}>
                  <PlusCircle className="mr-2" />
                  Create Location
                </Button>
              </div>
            ) : (
              <CalendarView
                assignments={assignmentsForCalendarView}
                members={members}
                locations={locations}
                viewMode={viewMode}
                onPinToggle={handlePinToggle}
                currentDate={currentDate}
                onMemberClick={handleMemberClick}
                onAddMemberClick={handleOpenAssignModal}
                onNewLocationClick={handleOpenCreateLocationModal}
              />
            )}
          </div>
        </main>
        <MemberDetailsModal
          member={selectedMember}
          isOpen={!!selectedMember}
          onOpenChange={(isOpen) => !isOpen && setSelectedMember(null)}
          scheduledHours={scheduledHours}
          maxHoursPerMonth={maxHoursPerMonth}
        />
        <AssignMemberModal
          assignmentContext={assignmentContext}
          members={members}
          assignments={sandboxAssignments}
          isOpen={!!assignmentContext}
          onOpenChange={(isOpen) => !isOpen && setAssignmentContext(null)}
          onAssignMember={handleAssignMember}
          onOpenCreateMemberModal={handleOpenCreateMemberModal}
        />
        <CreateMemberModal
          isOpen={isCreateMemberModalOpen}
          onOpenChange={setCreateMemberModalOpen}
          onCreateMember={handleCreateMember}
          locationName={
            locations.find((l) => l.id === locationToCreateIn)?.name || ''
          }
        />
        <CreateLocationModal
          isOpen={isCreateLocationModalOpen}
          onOpenChange={setCreateLocationModalOpen}
          onCreateLocation={handleCreateLocation}
        />
      </div>
    </TooltipProvider>
  );
}
