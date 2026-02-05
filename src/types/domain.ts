export type UserRole = 'Owner' | 'Admin' | 'Member' | 'Guest';

export interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
}

export interface MemberReference {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'away' | 'offline';
  isExternal?: boolean;
  expiryDate?: string; 
  accessProtocol?: 'Deep Isolation' | 'Standard Bridge' | 'Full Collaborative';
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberIds: string[]; 
}

export interface Organization {
  id: string;
  name: string;
  description: string; 
  isExternal?: boolean;
  role: UserRole;
  theme?: ThemeConfig;
  members: MemberReference[];
  teams: Team[];
}

export interface CapabilitySpec {
  id: string;
  name: string;
  type: 'ui' | 'api' | 'data';
  status: 'stable' | 'beta';
  description: string;
  icon?: string;
}

export interface Capability extends CapabilitySpec {
  config?: object;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  status: 'todo' | 'completed' | 'verified' | 'accepted';
  assignee?: string;
}

export interface WorkspaceIssue {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'closed';
}

export interface WorkspaceDaily {
  id: string;
  content: string;
  author: string;
  timestamp: number;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  timestamp: number;
}

export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  visibility: 'visible' | 'hidden'; 
  scope: string[];
  protocol: string;
  capabilities: Capability[]; 
  members: MemberReference[]; 
  teamIds?: string[];
  tasks?: WorkspaceTask[];
  issues?: WorkspaceIssue[];
  dailyLogs?: WorkspaceDaily[];
  files?: WorkspaceFile[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  read: boolean;
  timestamp: number;
}

export interface PulseLog {
  id: string;
  orgId: string;
  workspaceId?: string;
  timestamp: number;
  actor: string;
  action: string;
  target: string;
  type: 'create' | 'update' | 'delete' | 'access' | 'event';
}
