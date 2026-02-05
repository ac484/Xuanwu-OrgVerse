
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization, Workspace, ThemeConfig, UserRole, Notification, Capability, MemberReference, Team, PulseLog, WorkspaceTask, WorkspaceIssue, WorkspaceDaily, WorkspaceFile } from '@/types/domain';

interface AppState {
  user: User | null;
  organizations: Organization[];
  activeOrgId: string | null;
  workspaces: Workspace[];
  notifications: Notification[];
  pulseLogs: PulseLog[];
  
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'role' | 'members' | 'teams'>) => void;
  updateOrganization: (id: string, updates: Partial<Omit<Organization, 'id' | 'members' | 'teams'>>) => void;
  deleteOrganization: (id: string) => void;
  updateOrgTheme: (id: string, theme: ThemeConfig | undefined) => void;
  
  addPulseLog: (log: Omit<PulseLog, 'id' | 'timestamp' | 'orgId'>) => void;
  
  addOrgMember: (orgId: string, member: Omit<MemberReference, 'id' | 'status'>) => void;
  removeOrgMember: (orgId: string, memberId: string) => void;
  updateOrgMember: (orgId: string, memberId: string, updates: Partial<MemberReference>) => void;
  
  addOrgTeam: (orgId: string, team: Omit<Team, 'id' | 'memberIds'>) => void;
  removeOrgTeam: (orgId: string, teamId: string) => void;
  
  addMemberToTeam: (orgId: string, teamId: string, memberId: string) => void;
  removeMemberFromTeam: (orgId: string, teamId: string, memberId: string) => void;
  
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'capabilities' | 'members' | 'teamIds'>) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  addCapabilityToWorkspace: (workspaceId: string, capability: Partial<Capability> & Pick<Capability, 'name' | 'type' | 'description'>) => void;
  removeCapabilityFromWorkspace: (workspaceId: string, capabilityId: string) => void;
  
  toggleTeamAccessToWorkspace: (workspaceId: string, teamId: string) => void;
  
  addWorkspaceMember: (workspaceId: string, member: MemberReference) => void;
  removeWorkspaceMember: (workspaceId: string, memberId: string) => void;

  addTaskToWorkspace: (workspaceId: string, task: Omit<WorkspaceTask, 'id'>) => void;
  updateTaskStatus: (workspaceId: string, taskId: string, status: WorkspaceTask['status']) => void;
  addIssueToWorkspace: (workspaceId: string, issue: Omit<WorkspaceIssue, 'id'>) => void;
  addDailyLogToWorkspace: (workspaceId: string, log: Omit<WorkspaceDaily, 'id' | 'timestamp'>) => void;
  addFileToWorkspace: (workspaceId: string, file: Omit<WorkspaceFile, 'id' | 'timestamp'>) => void;
  
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      organizations: [
        { 
          id: 'personal', 
          name: '個人維度', 
          description: '個人基礎設施沙盒', 
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
      pulseLogs: [],

      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null, activeOrgId: 'personal' }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      setActiveOrg: (id) => set({ activeOrgId: id }),
      
      addPulseLog: (log) => set((state) => ({
        pulseLogs: [{
          ...log,
          id: `pulse-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: Date.now(),
          orgId: state.activeOrgId || 'personal'
        }, ...state.pulseLogs].slice(0, 100)
      })),

      addOrganization: (org) => set((state) => {
        const id = `org-${Math.random().toString(36).substring(2, 7)}`;
        return { 
          organizations: [...state.organizations, { 
            ...org, 
            id, 
            role: 'Owner' as UserRole,
            members: state.user ? [{ 
              id: `m-${Math.random().toString(36).substring(2, 6)}`, 
              name: state.user.name, 
              email: state.user.email, 
              role: 'Owner' as UserRole, 
              status: 'active' as const 
            }] : [],
            teams: []
          }], 
          activeOrgId: id 
        };
      }),

      updateOrganization: (id, updates) => {
        set((state) => ({
          organizations: state.organizations.map(o => o.id === id ? { ...o, ...updates } : o)
        }));
        get().addPulseLog({ actor: get().user?.name || 'System', action: '更新維度識別', target: id, type: 'update' });
      },

      deleteOrganization: (id) => set((state) => {
        const remaining = state.organizations.filter(o => o.id !== id);
        return {
          organizations: remaining.length > 0 ? remaining : state.organizations,
          activeOrgId: remaining.length > 0 ? remaining[0].id : state.activeOrgId,
          workspaces: state.workspaces.filter(w => w.orgId !== id)
        };
      }),
      
      updateOrgTheme: (id, theme) => set((state) => ({
        organizations: state.organizations.map(o => o.id === id ? { ...o, theme } : o)
      })),

      addOrgMember: (orgId, member) => {
        set((state) => ({
          organizations: state.organizations.map(o => o.id === orgId ? {
            ...o,
            members: [...(o.members || []), { ...member, id: `m-${Math.random().toString(36).substring(2, 6)}`, status: 'active' }]
          } : o)
        }));
        get().addPulseLog({ actor: get().user?.name || 'System', action: '同步身分', target: member.name, type: 'create' });
      },

      removeOrgMember: (orgId, memberId) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          members: (o.members || []).filter(m => m.id !== memberId),
          teams: (o.teams || []).map(t => ({ ...t, memberIds: (t.memberIds || []).filter(mid => mid !== memberId) }))
        } : o)
      })),

      updateOrgMember: (orgId, memberId, updates) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          members: (o.members || []).map(m => m.id === memberId ? { ...m, ...updates } : m)
        } : o)
      })),

      addOrgTeam: (orgId, team) => {
        set((state) => ({
          organizations: state.organizations.map(o => o.id === orgId ? {
            ...o,
            teams: [...(o.teams || []), { ...team, id: `team-${Math.random().toString(36).substring(2, 6)}`, memberIds: [] }]
          } : o)
        }));
        get().addPulseLog({ actor: get().user?.name || 'System', action: '定義團隊', target: team.name, type: 'create' });
      },

      removeOrgTeam: (orgId, teamId) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          teams: (o.teams || []).filter(t => t.id !== teamId)
        } : o)
      })),

      addMemberToTeam: (orgId, teamId, memberId) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          teams: (o.teams || []).map(t => t.id === teamId ? { 
            ...t, 
            memberIds: Array.from(new Set([...(t.memberIds || []), memberId])) 
          } : t)
        } : o)
      })),

      removeMemberFromTeam: (orgId, teamId, memberId) => set((state) => ({
        organizations: state.organizations.map(o => o.id === orgId ? {
          ...o,
          teams: (o.teams || []).map(t => t.id === teamId ? { 
            ...t, 
            memberIds: (t.memberIds || []).filter(mid => mid !== memberId) 
          } : t)
        } : o)
      })),
      
      addWorkspace: (workspace) => {
        set((state) => ({
          workspaces: [...state.workspaces, { 
            ...workspace, 
            id: `ws-${Math.random().toString(36).substring(2, 6)}`,
            capabilities: [],
            members: [],
            teamIds: [],
            tasks: [],
            issues: [],
            dailyLogs: [],
            files: []
          }]
        }));
        get().addPulseLog({ actor: get().user?.name || 'System', action: '初始化空間', target: workspace.name, type: 'create' });
      },

      updateWorkspace: (id, updates) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === id ? { ...w, ...updates } : w)
        }));
        get().addPulseLog({ actor: get().user?.name || 'System', action: '更新空間規格', target: id, type: 'update' });
      },

      deleteWorkspace: (id) => set((state) => {
        const remaining = state.workspaces.filter(w => w.id !== id);
        return {
          workspaces: remaining
        };
      }),

      addCapabilityToWorkspace: (workspaceId, capability) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === workspaceId ? {
            ...w,
            capabilities: [...(w.capabilities || []), { 
              ...capability, 
              id: capability.id || `cap-${Math.random().toString(36).substring(2, 6)}`,
              status: capability.status || 'stable'
            } as Capability]
          } : w)
        }));
        get().addPulseLog({ actor: get().user?.name || 'System', action: '掛載原子能力', target: capability.name, type: 'update' });
      },

      removeCapabilityFromWorkspace: (workspaceId, capabilityId) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          capabilities: (w.capabilities || []).filter(c => c.id !== capabilityId)
        } : w)
      })),

      toggleTeamAccessToWorkspace: (workspaceId, teamId) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => {
            if (w.id !== workspaceId) return w;
            const currentTeams = w.teamIds || [];
            const isAssigned = currentTeams.includes(teamId);
            return {
              ...w,
              teamIds: isAssigned ? currentTeams.filter(id => id !== teamId) : [...currentTeams, teamId]
            };
          })
        }));
        const ws = get().workspaces.find(w => w.id === workspaceId);
        get().addPulseLog({ 
          actor: get().user?.name || 'System', 
          action: '切換團隊共振', 
          target: ws?.name || workspaceId, 
          type: 'access' 
        });
      },

      addWorkspaceMember: (workspaceId, member) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          members: Array.from(new Set([...(w.members || []), member]))
        } : w)
      })),

      removeWorkspaceMember: (workspaceId, memberId) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          members: (w.members || []).filter(m => m.id !== memberId)
        } : w)
      })),

      addTaskToWorkspace: (workspaceId, task) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          tasks: [...(w.tasks || []), { ...task, id: `task-${Date.now()}` }]
        } : w)
      })),

      updateTaskStatus: (workspaceId, taskId, status) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          tasks: (w.tasks || []).map(t => t.id === taskId ? { ...t, status } : t)
        } : w)
      })),

      addIssueToWorkspace: (workspaceId, issue) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          issues: [...(w.issues || []), { ...issue, id: `issue-${Date.now()}` }]
        } : w)
      })),

      addDailyLogToWorkspace: (workspaceId, log) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          dailyLogs: [{ ...log, id: `daily-${Date.now()}`, timestamp: Date.now() }, ...(w.dailyLogs || [])]
        } : w)
      })),

      addFileToWorkspace: (workspaceId, file) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          files: [...(w.files || []), { ...file, id: `file-${Date.now()}`, timestamp: Date.now() }]
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
