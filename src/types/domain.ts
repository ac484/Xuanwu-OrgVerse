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
 * Workspace (邏輯容器/空間)
 * 職責：定義純粹的技術邊界與運行上下文。
 * 已整合專屬的能力註冊表 (Specs)。
 */
export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  context: string;   // 技術上下文
  scope: string[];   // 資源範圍
  resolver: string;  // 數據解析路徑
  policy: string;    // 安全與存取策略
  specs: ResourceBlock[]; // 該空間專屬的原子能力目錄
  members: MemberReference[]; // 該空間專屬的成員
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
