export type UserRole = 'Owner' | 'Admin' | 'Member' | 'Guest';
export type WorkspaceStatus = 'preparatory' | 'active' | 'stopped';

/**
 * 維度主題配置 (Dimension Theme)
 */
export interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
}

/**
 * 成員身分參考 (Member Reference)
 * 屬於「維度」或「空間」的身分實體
 */
export interface MemberReference {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'away' | 'offline';
  isExternal?: boolean;
  group?: string; 
  expiryDate?: string; 
  accessProtocol?: 'Deep Isolation' | 'Standard Bridge' | 'Full Collaborative';
}

/**
 * 治理層：部門團隊 (Governance Teams)
 */
export interface Team {
  id: string;
  name: string;
  description: string;
  memberIds: string[]; 
}

/**
 * 治理層：夥伴群組 (Governance Partner Groups)
 */
export interface PartnerGroup {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
}

/**
 * 第一層：維度 (Dimension / Organization)
 * 最頂層的主權邊界
 */
export interface Organization {
  id: string;
  name: string;
  description: string; 
  isExternal?: boolean;
  role: UserRole;
  theme?: ThemeConfig;
  members: MemberReference[];
  teams: Team[];
  partnerGroups: PartnerGroup[];
}

/**
 * 排班指派 (Schedule / Pulse)
 */
export interface ScheduleAssignment {
  id: string;
  memberId: string;
  memberName: string;
  locationId: string; 
  locationName: string; 
  date: string; 
  state: 'draft' | 'published';
}

/**
 * 第四層：原子能力規範 (Capability Spec)
 */
export interface CapabilitySpec {
  id: string;
  name: string;
  type: 'ui' | 'api' | 'data';
  status: 'stable' | 'beta';
  description: string;
  icon?: string;
}

/**
 * 掛載後的原子能力 (Mounted Capability)
 */
export interface Capability extends CapabilitySpec {
  config?: object;
}

/**
 * 第五層：原子數據 - 任務 (Atomic Task)
 */
export interface WorkspaceTask {
  id: string;
  parentId?: string; 
  name: string;
  description?: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number; 
  taxRate: number; 
  total: number; 
  progress: number; 
  weight: number; 
  location?: string;
  status: 'todo' | 'completed' | 'verified' | 'accepted';
  dependencies: string[]; 
  createdAt: any;
}

/**
 * 第五層：原子數據 - 議題 (Atomic Issue)
 */
export interface WorkspaceIssue {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'closed';
  type?: 'technical' | 'financial' | 'operational';
}

/**
 * 第三層：空間節點 (Workspace / Space Node)
 * 維度下的邏輯執行容器
 */
export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  status: WorkspaceStatus;
  visibility: 'visible' | 'hidden'; 
  scope: string[];
  protocol: string;
  capabilities: Capability[]; 
  members: MemberReference[]; 
  teamIds: string[]; 
  partnerGroupIds: string[]; 
  tasks?: WorkspaceTask[];
  issues?: WorkspaceIssue[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * 第五層：原子數據 - 脈動與通知 (Resonance)
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  read: boolean;
  timestamp: number;
}

/**
 * 維度脈動日誌 (Dimension Pulse Log)
 */
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
