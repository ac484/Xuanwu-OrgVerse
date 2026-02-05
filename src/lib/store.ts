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
  
  login: (userData: User) => void;
  logout: () => void;
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'role'>) => void;
  updateOrgTheme: (id: string, theme: ThemeConfig) => void;
  addContainer: (container: Omit<Container, 'id'>) => void;
  deleteContainer: (id: string) => void;
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
        { 
          id: 'p1', 
          orgId: 'personal', 
          name: 'Core Runtime', 
          context: 'user-default-context',
          scope: ['profile', 'private-data'],
          resolver: 'standard-resolver',
          policy: 'private-isolation'
        },
        { 
          id: 'a1', 
          orgId: 'acme', 
          name: 'Supply Chain Hub', 
          context: 'enterprise-node-v4',
          scope: ['inventory', 'logistics', 'partners'],
          resolver: 'federated-resolver',
          policy: 'zero-trust-policy'
        }
      ],
      notifications: [
        { id: 'n1', title: 'System Activation', message: 'Dimension resonance is now stable.', type: 'success', read: false, timestamp: Date.now() },
      ],
      teamMembers: [
        { id: 't1', name: 'Sarah Connor', role: 'Admin', status: 'active', email: 'sarah@orgverse.io' },
      ],
      resourceBlocks: [
        { id: 'b1', name: 'Logic Engine v2', type: 'api', status: 'stable', description: 'Core computational logic block.' },
      ],

      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null, activeOrgId: 'personal' }),
      setActiveOrg: (id) => set({ activeOrgId: id }),
      
      addOrganization: (org) => set((state) => {
        const id = Math.random().toString(36).substring(2, 11);
        const newOrg = { ...org, id, role: 'Owner' as UserRole };
        return { organizations: [...state.organizations, newOrg], activeOrgId: id };
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
    { name: 'orgverse-storage' }
  )
);
