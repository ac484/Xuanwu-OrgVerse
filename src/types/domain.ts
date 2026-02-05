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
  group?: string; // 用於外部夥伴的分組概念
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

export interface OrgLocation {
  id: string;
  name: string;
}

export interface ScheduleAssignment {
  id: string;
  memberId: string;
  memberName: string;
  locationId: string; // 對齊至 WorkspaceId
  locationName: string; // 對齊至 WorkspaceName
  date: string; // ISO date string YYYY-MM-DD
  state: 'draft' | 'published';
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
  parentId?: string; // WBS 父節點
  name: string;
  description?: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  quantity: number;
  unitPrice: number;
  subtotal: number; // 自動計算: Quantity * UnitPrice
  location?: string;
  space?: string;
  startTime?: any;
  endTime?: any;
  status: 'todo' | 'completed' | 'verified' | 'accepted';
  dependencies: string[]; // 相依任務 ID 陣列
  createdAt: any;
}

export interface WorkspaceIssue {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'closed';
  type?: 'technical' | 'financial' | 'operational';
}

export interface WorkspaceDaily {
  id: string;
  content: string;
  author: string;
  timestamp: number;
}

export interface WorkspaceFileVersion {
  versionId: string;
  versionNumber: number;
  versionName: string;
  size: string;
  uploadedBy: string;
  createdAt: any;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  currentVersionId: string;
  versions: WorkspaceFileVersion[];
  updatedAt: any;
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
  timestamp: any;
  actor: string;
  action: string;
  target: string;
  type: 'create' | 'update' | 'delete' | 'access' | 'event';
}
