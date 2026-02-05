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

export interface Organization {
  id: string;
  name: string;
  context: string;
  isExternal?: boolean;
  role: UserRole;
  theme?: ThemeConfig;
  members: MemberReference[];
}

/**
 * ResourceBlock (原子能力規範)
 * 職責：描述可掛載於 Workspace 的獨立業務能力。
 */
export interface ResourceBlock {
  id: string;
  name: string;
  type: 'component' | 'api' | 'data';
  status: 'stable' | 'beta';
  description: string;
  spec?: object; // 技術規範定義
}

/**
 * Workspace (邏輯空間)
 * 職責：定義純粹的技術邊界與運行上下文。
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