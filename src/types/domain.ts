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
}

/**
 * Team (組織團隊/部門)
 * 職責：組織內部的邏輯分組，如技術部、行銷部。
 */
export interface Team {
  id: string;
  name: string;
  description: string;
  memberIds: string[]; // 引用 Organization.members 的 ID
}

export interface Organization {
  id: string;
  name: string;
  context: string;
  isExternal?: boolean;
  role: UserRole;
  theme?: ThemeConfig;
  members: MemberReference[];
  teams: Team[];
}

/**
 * ResourceBlock (原子能力規範)
 */
export interface ResourceBlock {
  id: string;
  name: string;
  type: 'component' | 'api' | 'data';
  status: 'stable' | 'beta';
  description: string;
  spec?: object;
}

/**
 * Workspace (邏輯空間)
 */
export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  context: string;   
  scope: string[];   
  resolver: string;  
  policy: string;    
  specs: ResourceBlock[]; 
  members: MemberReference[]; 
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
