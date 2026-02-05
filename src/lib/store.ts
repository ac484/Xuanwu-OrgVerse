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
        { id: 'personal', name: '個人維度', context: '個人基礎設施沙盒', role: 'Owner' },
        { id: 'acme', name: '頂尖企業', context: '企業級製造與生產共振', role: 'Admin' },
      ],
      activeOrgId: 'personal',
      containers: [
        { 
          id: 'c1', 
          orgId: 'personal', 
          name: '主控節點', 
          context: 'runtime-standard-v1',
          scope: ['auth', 'private-data'],
          resolver: 'local-gateway',
          policy: 'strict-isolation'
        }
      ],
      notifications: [
        { id: 'n1', title: '共振已建立', message: '維度橋接器現已啟用。', type: 'success', read: false, timestamp: Date.now() },
      ],
      teamMembers: [
        { id: 't1', name: '核心架構師', role: 'Owner', status: 'active', email: 'architect@orgverse.io' },
      ],
      resourceBlocks: [
        { id: 'b1', name: '身分解析器', type: 'api', status: 'stable', description: '核心身分驗證協議區塊。' },
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
        containers: [...state.containers, { ...container, id: `cid-${Math.random().toString(36).substring(2, 6)}` }]
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
