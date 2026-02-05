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
 * Workspace (邏輯容器/空間)
 * 職責：定義純粹的技術邊界與運行上下文。不涉及具體業務。
 */
export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  context: string;   // 技術上下文 (例如: "runtime-standard-v1")
  scope: string[];   // 資源範圍 (例如: ["auth", "storage"])
  resolver: string;  // 數據解析路徑 (Facade/Event Interface)
  policy: string;    // 安全與存取策略 (Access Control)
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

/**
 * ResourceBlock (能力模組規範)
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
