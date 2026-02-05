export type UserRole = 'Owner' | 'Admin' | 'Member' | 'Guest';

export interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
}

export interface Organization {
  id: string;
  name: string;
  context: string;
  isExternal?: boolean;
  role: UserRole;
  theme?: ThemeConfig;
}

/**
 * Logical Container (Workspace)
 * 職責：純粹的基礎設施定義，定義運行上下文與資源邊界。
 */
export interface Container {
  id: string;
  orgId: string;
  name: string;
  context: string;   // 技術上下文 (例如: "runtime-standard-v1")
  scope: string[];   // 資源範圍 (例如: ["auth", "storage"])
  resolver: string;  // 數據解析路徑
  policy: string;    // 安全與存取策略
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

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  status: 'active' | 'away' | 'offline';
  email: string;
}

export interface ResourceBlock {
  id: string;
  name: string;
  type: 'component' | 'api' | 'data';
  status: 'stable' | 'beta';
  description: string;
}
