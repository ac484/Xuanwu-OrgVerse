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

/**
 * Atomic Capability (原子能力)
 */
export interface Capability {
  id: string;
  name: string;
  type: 'ui' | 'api' | 'data';
  status: 'stable' | 'beta';
  description: string;
  config?: object;
}

/**
 * Workspace (邏輯空間)
 */
export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  visibility: 'visible' | 'hidden'; 
  scope: string[]; // 授權範疇
  protocol: string;  
  capabilities: Capability[]; 
  members: MemberReference[]; 
  teamIds?: string[]; // 關聯的團隊 ID
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

/**
 * Pulse Log (維度脈動日誌)
 */
export interface PulseLog {
  id: string;
  orgId: string;
  timestamp: number;
  actor: string;
  action: string;
  target: string;
  type: 'create' | 'update' | 'delete' | 'access';
}
