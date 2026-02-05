export type TaskId = string;

export const PRIORITIES = ['None', 'Low', 'Medium', 'High', 'Urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = [
  'To Do',
  'In Progress',
  'Done',
  'On Hold',
  'Cancelled',
] as const;
export type Status = (typeof STATUSES)[number];

export interface Task {
  id: TaskId;
  no: string; // Hierarchical number, e.g., "1.2.1"
  name: string;
  description: string;
  type: string;
  priority: Priority;
  owner: string;
  assignees: string[];
  tags: string[];

  // Costing
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  taxRate: number; // as a percentage, e.g. 5 for 5%

  // Schedule
  startTime: string | null; // Planned Start
  endTime: string | null; // Planned End
  actualStartTime: string | null;
  actualEndTime: string | null;

  // Progress
  progress: number; // 0-100
  weight: number; // for weighted progress calculation
  status: Status;

  // Context
  location: string;
  space: string;
  attachments: string[];

  // Relationships
  dependencies: TaskId[];
  children: Task[];

  // Governance
  locked: boolean;

  // Completion
  completedBy: string | null;
  completedAt: string | null;
}

// Represents a Task in the context of the UI, with calculated fields
export interface TaskNode extends Task {
  children: TaskNode[];
  level: number;
  isExpanded: boolean;

  // Calculated cost
  subtotal: number; // quantity * unitPrice
  total: number; // subtotal * (1 + taxRate/100)

  budgetMeta?: {
    descendantSubtotal: number;
    overBudgetBy: number;
    isViolating: boolean;
  };
  isAnscestorViolating?: boolean;
}
