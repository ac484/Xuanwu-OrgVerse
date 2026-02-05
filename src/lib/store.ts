import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization, Container, ThemeConfig, UserRole } from '@/types/domain';

interface AppState {
  user: User | null;
  organizations: Organization[];
  activeOrgId: string | null;
  containers: Container[];
  
  // Auth Actions
  login: (userData: User) => void;
  logout: () => void;
  
  // Org Actions
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'role'>) => void;
  updateOrgTheme: (id: string, theme: ThemeConfig) => void;
  
  // Container Actions
  addContainer: (container: Omit<Container, 'id'>) => void;
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
