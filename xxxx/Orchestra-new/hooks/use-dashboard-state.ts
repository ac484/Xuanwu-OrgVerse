'use client';

import { useState } from 'react';
import {
  initialMembers,
  initialLiveAssignments,
  initialSandboxAssignments,
  locations as initialLocations,
} from '@/lib/data';
import type { Assignments, Location, Member } from '@/lib/types';

/**
 * A simple hook to manage the core data state for the dashboard.
 * Its single responsibility is to hold state and provide setters.
 * The "Assembly" (connecting logic to state) happens in the page component that uses this hook.
 */
export function useScheduleData() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [liveAssignments, setLiveAssignments] =
    useState<Assignments>(initialLiveAssignments);
  const [sandboxAssignments, setSandboxAssignments] = useState<Assignments>(
    initialSandboxAssignments
  );

  return {
    members,
    setMembers,
    locations,
    setLocations,
    liveAssignments,
    setLiveAssignments,
    sandboxAssignments,
    setSandboxAssignments,
  };
}
