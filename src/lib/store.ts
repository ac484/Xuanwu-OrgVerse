
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization, Workspace, ThemeConfig, UserRole, Notification, TeamMember, ResourceBlock } from '@/types/domain';

/**
 * AppState - 職責：維度狀態管理核心
 * 已準備好 Firebase 串接，移除了大部分 Mock 邏輯。
 */
interface AppState {
  user: User | null;
  organizations: Organization[];
  activeOrgId: string | null;
  workspaces: Workspace[];
  notifications: Notification[];
  teamMembers: TeamMember[];
  resourceBlocks: ResourceBlock[];
  
  login: (userData: User) => void;
  logout: () => void;
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'role'>) => void;
  updateOrgTheme: (id: string, theme: ThemeConfig) => void;
  addWorkspace: (workspace: Omit<Workspace, 'id'>) => void;
  deleteWorkspace: (id: string) => void;
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
      ],
      activeOrgId: 'personal',
      workspaces: [],
      notifications: [],
      teamMembers: [],
      resourceBlocks: [
        { id: 'b1', name: '身分共鳴模組', type: 'api', status: 'stable', description: '處理跨維度身分識別的原子化單元。' },
        { id: 'b2', name: '資源監測模組', type: 'component', status: 'beta', description: '即時可視化邏輯容器內資源流向。' },
      ],

      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null, activeOrgId: 'personal' }),
      setActiveOrg: (id) => set({ activeOrgId: id }),
      
      addOrganization: (org) => set((state) => {
        const id = `org-${Math.random().toString(36).substring(2, 7)}`;
        const newOrg = { ...org, id, role: 'Owner' as UserRole };
        return { organizations: [...state.organizations, newOrg], activeOrgId: id };
      }),
      
      updateOrgTheme: (id, theme) => set((state) => ({
        organizations: state.organizations.map(o => o.id === id ? { ...o, theme } : o)
      })),
      
      addWorkspace: (workspace) => set((state) => ({
        workspaces: [...state.workspaces, { ...workspace, id: `ws-${Math.random().toString(36).substring(2, 6)}` }]
      })),

      deleteWorkspace: (id) => set((state) => ({
        workspaces: state.workspaces.filter(w => w.id !== id)
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
    { name: 'orgverse-atomic-storage' }
  )
);
