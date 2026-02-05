'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { summarizeSchedule } from '@/ai/flows/schedule-summary-and-insights';
import {
  generateSchedule,
  type GenerateScheduleOutput,
} from '@/ai/ai-schedule-draft-generation';
import type { Assignments, JobStatus, Member, Location } from '@/lib/types';

/**
 * A hook for orchestrating AI-driven scheduling and analysis tasks.
 * It manages the job status and communication with AI flows.
 * This hook is responsible for the "how" (calling AI), but not the "what" (updating state).
 */
export function useAiScheduler(
  currentDate: Date,
  selectedLocation: Location | null,
  members: Member[]
) {
  const [jobStatus, setJobStatus] = useState<JobStatus>('IDLE');
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    insights: string;
  } | null>(null);
  const { toast } = useToast();

  /**
   * Clears the current AI-generated summary.
   */
  const clearSummary = useCallback(() => setAiSummary(null), []);

  /**
   * Calls the AI flow to generate a schedule draft.
   * Manages its own job status and toasts related to the generation process.
   * @param sandboxAssignments - The current sandbox assignments to check for pinned members.
   * @returns The raw output from the AI, or null if an error occurs.
   */
  const generateScheduleDraft = async (
    sandboxAssignments: Assignments
  ): Promise<GenerateScheduleOutput | null> => {
    if (!selectedLocation) {
      toast({
        title: 'No Location Selected',
        description: 'Please select a location to schedule.',
        variant: 'destructive',
      });
      return null;
    }

    setJobStatus('PENDING');
    clearSummary();
    toast({
      title: 'Scheduling job started',
      description: `The AI is generating a new schedule draft for ${selectedLocation.name}.`,
    });
    setJobStatus('PROCESSING');

    const membersForLocation = members
      .filter((m) => m.locationId === selectedLocation.id)
      .map((m) => {
        const isPinned = sandboxAssignments.some(
          (s) =>
            isSameMonth(new Date(s.date), currentDate) &&
            s.locationId === selectedLocation.id &&
            s.memberId === m.id &&
            s.isPinned
        );
        return { ...m, isPinned };
      });

    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const result = await generateSchedule({
        members: membersForLocation,
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
        locationName: selectedLocation.name,
      });

      setJobStatus('COMPLETED');
      toast({
        title: 'Draft generated',
        description: `The AI has created a new draft for ${selectedLocation.name}.`,
        variant: 'default',
      });

      return result;
    } catch (error) {
      console.error('Error during AI schedule generation:', error);
      setJobStatus('ERROR');
      toast({
        title: 'Scheduling failed',
        description: `Could not generate schedule for ${selectedLocation.name}. Please try again.`,
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Calls the AI flow to generate a summary and insights for a given set of assignments.
   * @param assignmentsToSummarize - The assignments to be summarized.
   */
  const generateScheduleSummary = async (
    assignmentsToSummarize: Assignments
  ) => {
    if (!selectedLocation) return;
    toast({
      title: 'Analyzing schedule...',
      description: 'The AI is generating insights for the new draft.',
    });
    const assignmentsForSummary = assignmentsToSummarize.filter(
      (assignment) =>
        isSameMonth(new Date(assignment.date), currentDate) &&
        assignment.locationId === selectedLocation.id
    );
    try {
      const assignmentsJson = JSON.stringify(assignmentsForSummary);
      const summaryResult = await summarizeSchedule({
        assignmentsData: assignmentsJson,
      });
      setAiSummary(summaryResult);
    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast({
        title: 'Analysis failed',
        description: 'Could not generate AI insights for the schedule.',
        variant: 'destructive',
      });
    }
  };

  return {
    jobStatus,
    aiSummary,
    clearSummary,
    generateScheduleDraft,
    generateScheduleSummary,
  };
}
