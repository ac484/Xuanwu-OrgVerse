import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization, Workspace, ThemeConfig, UserRole, Notification, TeamMember, ResourceBlock } from '@/types/domain';

/**
 * AppState - 職責：維度狀態管理核心
 * 已實現 Workspace 與 Specs 的深度整合。
 */
interface AppState {
  user: User | null;
  organizations: Organization[];
  activeOrgId: string | null;
  workspaces: Workspace[];
  notifications: Notification[];
  teamMembers: TeamMember[];
  
  login: (userData: User) => void;
  logout: () => void;
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'role'>) => void;
  updateOrgTheme: (id: string, theme: ThemeConfig) => void;
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'specs'>) => void;
  deleteWorkspace: (id: string) => void;
  addSpecToWorkspace: (workspaceId: string, spec: Omit<ResourceBlock, 'id'>) => void;
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
        workspaces: [...state.workspaces, { 
          ...workspace, 
          id: `ws-${Math.random().toString(36).substring(2, 6)}`,
          specs: [] // 初始空間不帶任何規範
        }]
      })),

      deleteWorkspace: (id) => set((state) => ({
        workspaces: state.workspaces.filter(w => w.id !== id)
      })),

      addSpecToWorkspace: (workspaceId, spec) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          specs: [...w.specs, { ...spec, id: `spec-${Math.random().toString(36).substring(2, 6)}` }]
        } : w)
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
