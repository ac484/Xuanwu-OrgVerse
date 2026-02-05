import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization, Container, ThemeConfig, UserRole, Notification, TeamMember, ResourceBlock } from '@/types/domain';

interface AppState {
  user: User | null;
  organizations: Organization[];
  activeOrgId: string | null;
  containers: Container[];
  notifications: Notification[];
  teamMembers: TeamMember[];
  resourceBlocks: ResourceBlock[];
  
  // Auth Actions
  login: (userData: User) => void;
  logout: () => void;
  
  // Org Actions
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'role'>) => void;
  updateOrgTheme: (id: string, theme: ThemeConfig) => void;
  
  // Container Actions
  addContainer: (container: Omit<Container, 'id'>) => void;
  deleteContainer: (id: string) => void;

  // Notification Actions
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
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
      notifications: [
        { id: 'n1', title: 'System Activation', message: 'Dimension resonance is now stable.', type: 'success', read: false, timestamp: Date.now() },
        { id: 'n2', title: 'Resource Alert', message: 'Sandbox isolation levels are optimal.', type: 'info', read: true, timestamp: Date.now() - 100000 },
      ],
      teamMembers: [
        { id: 't1', name: 'Sarah Connor', role: 'Admin', status: 'active', email: 'sarah@orgverse.io' },
        { id: 't2', name: 'Kyle Reese', role: 'Member', status: 'away', email: 'kyle@orgverse.io' },
      ],
      resourceBlocks: [
        { id: 'b1', name: 'Logic Engine v2', type: 'api', status: 'stable', description: 'Core computational logic block.' },
        { id: 'b2', name: 'Auth Node', type: 'component', status: 'beta', description: 'Identity verification module.' },
      ],

      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null, activeOrgId: 'personal' }),
      setActiveOrg: (id) => set({ activeOrgId: id }),
      
      addOrganization: (org) => set((state) => {
        const id = Math.random().toString(36).substring(2, 11);
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
        containers: [...state.containers, { ...container, id: Math.random().toString(36).substring(2, 11) }]
      })),

      deleteContainer: (id) => set((state) => ({
        containers: state.containers.filter(c => c.id !== id)
      })),

      addNotification: (notif) => set((state) => ({
        notifications: [{ 
          ...notif, 
          id: Math.random().toString(36).substring(2, 9), 
          timestamp: Date.now(), 
          read: false 
        }, ...state.notifications]
      })),

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'orgverse-storage',
    }
  )
);
