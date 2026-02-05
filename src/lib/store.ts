import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization, Workspace, ThemeConfig, UserRole, Notification, ResourceBlock, MemberReference, Team } from '@/types/domain';

interface AppState {
  user: User | null;
  organizations: Organization[];
  activeOrgId: string | null;
  workspaces: Workspace[];
  notifications: Notification[];
  
  login: (userData: User) => void;
  logout: () => void;
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'role' | 'members' | 'teams'>) => void;
  updateOrgTheme: (id: string, theme: ThemeConfig) => void;
  
  // 組織成員 (Organization Members)
  addOrgMember: (orgId: string, member: Omit<MemberReference, 'id' | 'status'>) => void;
  removeOrgMember: (orgId: string, memberId: string) => void;
  
  // 組織團隊 (Organization Teams)
  addOrgTeam: (orgId: string, team: Omit<Team, 'id' | 'memberIds'>) => void;
  removeOrgTeam: (orgId: string, teamId: string) => void;
  
  // 團隊成員分派 (Organization Team Members)
  addMemberToTeam: (orgId: string, teamId: string, memberId: string) => void;
  removeMemberFromTeam: (orgId: string, teamId: string, memberId: string) => void;
  
  // 邏輯空間 (Workspace) 管理
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'specs' | 'members'>) => void;
  deleteWorkspace: (id: string) => void;
  addSpecToWorkspace: (workspaceId: string, spec: Omit<ResourceBlock, 'id'>) => void;
  removeSpecFromWorkspace: (workspaceId: string, specId: string) => void;
  
  // 空間專屬成員管理 (Workspace Members)
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
          ],
          teams: []
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
          }] : [],
          teams: []
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
          members: o.members.filter(m => m.id !== memberId),
          teams: o.teams.map(t => ({ ...t, memberIds: t.memberIds.filter(mid => mid !== memberId) }))
        } : o)
      })),

      addOrgTeam: (orgId, team) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          teams: [...o.teams, { ...team, id: `team-${Math.random().toString(36).substring(2, 6)}`, memberIds: [] }]
        } : o)
      })),

      removeOrgTeam: (orgId, teamId) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          teams: o.teams.filter(t => t.id !== teamId)
        } : o)
      })),

      addMemberToTeam: (orgId, teamId, memberId) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          teams: o.teams.map(t => t.id === teamId ? { 
            ...t, 
            memberIds: Array.from(new Set([...t.memberIds, memberId])) 
          } : t)
        } : o)
      })),

      removeMemberFromTeam: (orgId, teamId, memberId) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          teams: o.teams.map(t => t.id === teamId ? { 
            ...t, 
            memberIds: t.memberIds.filter(mid => mid !== memberId) 
          } : t)
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