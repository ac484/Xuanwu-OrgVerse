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
 * 邏輯容器 (Logical Container/Workspace)
 * 職責：定義基礎設施範圍，不包含具體業務流程。
 */
export interface Container {
  id: string;
  orgId: string;
  name: string;
  // 以下為純基礎設施定義
  context: string;   // 工作空間上下文 (例如: "runtime-node-v1")
  scope: string[];   // 定義範圍 (例如: ["auth", "storage", "compute"])
  resolver: string;  // 數據解析器標識 (例如: "graphql-gateway")
  policy: string;    // 存取與行為策略 (例如: "strict-isolation-v2")
}

export interface BusinessModule {
  id: string;
  name: string;
  capability: 'journal' | 'asset-management' | 'logic-engine';
  status: 'active' | 'suspended';
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
