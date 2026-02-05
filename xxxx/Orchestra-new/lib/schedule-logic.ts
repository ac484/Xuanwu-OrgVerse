import { isSameMonth } from 'date-fns';
import type {
  Location,
  Member,
  MemberFormValues,
  Assignments,
  Assignment,
} from './types';
import type { GenerateScheduleOutput } from '@/ai/ai-schedule-draft-generation';
import { PlaceHolderImages } from './placeholder-images';

/**
 * Creates a new location. This is an atomic function.
 */
export function createLocation(name: string): Location {
  const newLocation: Location = { id: crypto.randomUUID(), name };
  return newLocation;
}

/**
 * Creates a new member object from form data. This is an atomic function.
 */
export function createMember(
  data: MemberFormValues,
  locationId: string
): Member {
  const newMemberId = crypto.randomUUID();

  // Deterministically select an avatar from the placeholder list
  const imageIndex =
    (parseInt(newMemberId.substring(0, 8), 16) || 0) %
    PlaceHolderImages.length;
  const avatarUrl =
    PlaceHolderImages[imageIndex]?.imageUrl ||
    `https://picsum.photos/seed/${newMemberId.slice(0, 8)}/300/300`;

  const newMember: Member = {
    id: newMemberId,
    name: data.name,
    role: data.role,
    avatarUrl: avatarUrl,
    locationId: locationId,
    constraints: {
      unavailableDays: data.unavailableDays || [],
      maxHoursPerWeek: data.maxHoursPerWeek,
      teamAffinity: [],
    },
  };
  return newMember;
}

/**
 * Assigns a member to a location for a specific date, checking for conflicts.
 * Returns the updated assignments if successful, or null if there's a conflict.
 * This is an atomic function for a single assignment operation.
 */
export function assignMember(
  assignments: Assignments,
  assignmentContext: { date: string; locationId: string },
  memberId: string
): Assignments | null {
  // A member cannot be scheduled on the same day, regardless of location.
  const memberIsAlreadyScheduled = assignments.some(
    (s) => s.date === assignmentContext.date && s.memberId === memberId
  );

  if (memberIsAlreadyScheduled) {
    return null; // Indicates a conflict
  }

  const newAssignment: Assignment = {
    id: crypto.randomUUID(),
    date: assignmentContext.date,
    locationId: assignmentContext.locationId,
    memberId: memberId,
    state: 'DRAFT',
    isPinned: false,
  };

  return [...assignments, newAssignment];
}

/**
 * Takes the raw output from the AI schedule generator and processes it into
 * a new list of sandbox assignments, respecting existing pinned assignments.
 * This is a pure data transformation function.
 */
export function processAiGeneratedAssignments(
  aiOutput: GenerateScheduleOutput,
  existingSandboxAssignments: Assignments,
  selectedLocationId: string,
  currentDate: Date
): Assignments {
  const newAssignmentsFromAI: Assignment[] = aiOutput.assignments
    .filter((a) => a.memberId)
    .map((a) => ({
      id: crypto.randomUUID(),
      date: a.date,
      memberId: a.memberId!,
      locationId: selectedLocationId,
      isPinned: false,
      state: 'DRAFT',
    }));

  // Filter out old unpinned assignments for the current month and location
  const updatedAssignments = existingSandboxAssignments.filter(
    (existingAssignment) => {
      const isForCurrentMonthAndLocation =
        existingAssignment.locationId === selectedLocationId &&
        isSameMonth(new Date(existingAssignment.date), currentDate);
      return !isForCurrentMonthAndLocation || existingAssignment.isPinned;
    }
  );

  // Add the new assignments from the AI
  updatedAssignments.push(...newAssignmentsFromAI);

  return updatedAssignments;
}

/**
 * Computes the new live assignment state after publishing from the sandbox.
 * This is a pure function that returns the new state without side effects.
 */
export function publishSandboxChanges(
  liveAssignments: Assignments,
  sandboxAssignments: Assignments,
  currentDate: Date,
  selectedLocationId: string
): Assignments {
  // Get all the sandbox assignments for the current month and location
  const sandboxAssignmentsForMonth = sandboxAssignments.filter(
    (s) =>
      isSameMonth(new Date(s.date), currentDate) &&
      s.locationId === selectedLocationId
  );

  // Filter out the live assignments that correspond to the sandbox month/location
  const otherLiveAssignments = liveAssignments.filter(
    (s) =>
      !isSameMonth(new Date(s.date), currentDate) ||
      s.locationId !== selectedLocationId
  );

  // Combine the other live assignments with the new sandbox assignments
  const newLiveAssignments = [
    ...otherLiveAssignments,
    ...sandboxAssignmentsForMonth.map((s) => ({
      ...s,
      state: 'PUBLISHED' as const,
    })),
  ];

  return newLiveAssignments;
}
