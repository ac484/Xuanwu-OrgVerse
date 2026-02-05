import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'Owner' | 'Admin' | 'Member' | 'Guest';

export interface Organization {
  id: string;
  name: string;
  context: string;
  isExternal?: boolean;
  role: UserRole;
  theme?: {
    primary: string;
    background: string;
    accent: string;
  };
}

export interface Container {
  id: string;
  orgId: string;
  name: string;
  type: 'project' | 'resource' | 'sandbox';
}

interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  organizations: Organization[];
  activeOrgId: string | null;
  containers: Container[];
  
  login: (userData: { id: string; name: string; email: string }) => void;
  logout: () => void;
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'role'>) => void;
  addContainer: (container: Omit<Container, 'id'>) => void;
  updateOrgTheme: (id: string, theme: Organization['theme']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      organizations: [
        { id: 'personal', name: 'Personal Space', context: 'Individual creative sandbox', role: 'Owner' },
        { id: 'acme', name: 'Acme Corp', context: 'Industrial manufacturing global leader', role: 'Admin' },
        { id: 'design-collective', name: 'Design Collective', context: 'Collaborative art and design group', role: 'Guest', isExternal: true },
      ],
      activeOrgId: 'personal',
      containers: [
        { id: 'p1', orgId: 'personal', name: 'Daily Journal', type: 'sandbox' },
        { id: 'a1', orgId: 'acme', name: 'Supply Chain 2024', type: 'project' },
        { id: 'd1', orgId: 'design-collective', name: 'Winter Campaign', type: 'project' },
      ],

      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null, activeOrgId: 'personal' }),
      setActiveOrg: (id) => set({ activeOrgId: id }),
      addOrganization: (org) => set((state) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newOrg = { ...org, id, role: 'Owner' as UserRole };
        return { 
          organizations: [...state.organizations, newOrg],
          activeOrgId: id
        };
      }),
      updateOrgTheme: (id, theme) => set((state) => ({
        organizations: state.organizations.map(o => o.id === id ? { ...o, theme } : o)
      })),
      addContainer: (container) => set((state) => ({
        containers: [...state.containers, { ...container, id: Math.random().toString(36).substr(2, 9) }]
      })),
    }),
    {
      name: 'orgverse-storage',
    }
  )
);