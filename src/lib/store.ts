import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization, Workspace, ThemeConfig, UserRole, Notification, ResourceBlock, MemberReference } from '@/types/domain';

/**
 * AppState - 職責：維度狀態管理核心
 * 實現 Organization 與 Workspace 雙層級成員管理。
 */
interface AppState {
  user: User | null;
  organizations: Organization[];
  activeOrgId: string | null;
  workspaces: Workspace[];
  notifications: Notification[];
  
  login: (userData: User) => void;
  logout: () => void;
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'role' | 'members'>) => void;
  updateOrgTheme: (id: string, theme: ThemeConfig) => void;
  
  // 組織成員管理 (全局)
  addOrgMember: (orgId: string, member: Omit<MemberReference, 'id' | 'status'>) => void;
  removeOrgMember: (orgId: string, memberId: string) => void;
  
  // 邏輯空間 (Workspace) 管理
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'specs' | 'members'>) => void;
  deleteWorkspace: (id: string) => void;
  addSpecToWorkspace: (workspaceId: string, spec: Omit<ResourceBlock, 'id'>) => void;
  removeSpecFromWorkspace: (workspaceId: string, specId: string) => void;
  
  // 空間專屬成員管理
  addWorkspaceMember: (workspaceId: string, member: Omit<MemberReference, 'id' | 'status'>) => void;
  removeWorkspaceMember: (workspaceId: string, memberId: string) => void;
  
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      organizations: [
        { 
          id: 'personal', 
          name: '個人維度', 
          context: '個人基礎設施沙盒', 
          role: 'Owner',
          members: [
            { id: 'm1', name: '展示用戶', email: 'demo@orgverse.io', role: 'Owner', status: 'active' }
          ]
        },
      ],
      activeOrgId: 'personal',
      workspaces: [],
      notifications: [],

      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null, activeOrgId: 'personal' }),
      setActiveOrg: (id) => set({ activeOrgId: id }),
      
      addOrganization: (org) => set((state) => {
        const id = `org-${Math.random().toString(36).substring(2, 7)}`;
        const newOrg = { 
          ...org, 
          id, 
          role: 'Owner' as UserRole,
          members: state.user ? [{ 
            id: 'm-owner', 
            name: state.user.name, 
            email: state.user.email, 
            role: 'Owner' as UserRole, 
            status: 'active' as const 
          }] : []
        };
        return { organizations: [...state.organizations, newOrg], activeOrgId: id };
      }),
      
      updateOrgTheme: (id, theme) => set((state) => ({
        organizations: state.organizations.map(o => o.id === id ? { ...o, theme } : o)
      })),

      addOrgMember: (orgId, member) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          members: [...o.members, { ...member, id: `m-${Math.random().toString(36).substring(2, 6)}`, status: 'offline' }]
        } : o)
      })),

      removeOrgMember: (orgId, memberId) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          members: o.members.filter(m => m.id !== memberId)
        } : o)
      })),
      
      addWorkspace: (workspace) => set((state) => ({
        workspaces: [...state.workspaces, { 
          ...workspace, 
          id: `ws-${Math.random().toString(36).substring(2, 6)}`,
          specs: [],
          members: [] 
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

      removeSpecFromWorkspace: (workspaceId, specId) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          specs: w.specs.filter(s => s.id !== specId)
        } : w)
      })),

      addWorkspaceMember: (workspaceId, member) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          members: [...w.members, { ...member, id: `wm-${Math.random().toString(36).substring(2, 6)}`, status: 'offline' }]
        } : w)
      })),

      removeWorkspaceMember: (workspaceId, memberId) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          members: w.members.filter(m => m.id !== memberId)
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
    { name: 'orgverse-logic-storage' }
  )
);