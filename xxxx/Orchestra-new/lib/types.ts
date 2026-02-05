import { z } from 'zod';

export type AssignmentState = 'EMPTY' | 'DRAFT' | 'PUBLISHED' | 'CONFLICT';

export type Constraints = {
  unavailableDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  maxHoursPerWeek: number;
  teamAffinity: string[]; // array of member IDs
};

export type Location = {
  id: string;
  name: string;
};

export type Member = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  locationId: string;
  constraints: Constraints;
};

export type Assignment = {
  id: string;
  date: string; // ISO date string e.g., "2024-07-28"
  memberId: string;
  locationId: string;
  state: AssignmentState;
  isPinned: boolean;
};

export type Assignments = Assignment[];

export type JobStatus = 'IDLE' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// This is the zod schema from CreateMemberModal, now shared.
export const memberFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  role: z.string().min(2, 'Role must be at least 2 characters.'),
  maxHoursPerWeek: z.coerce.number().min(1).max(80),
  unavailableDays: z.array(z.number()).optional(),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
