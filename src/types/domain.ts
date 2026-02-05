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

export interface Container {
  id: string;
  orgId: string;
  name: string;
  type: 'project' | 'resource' | 'sandbox';
}

export interface User {
  id: string;
  name: string;
  email: string;
}
