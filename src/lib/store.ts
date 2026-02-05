import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization, Workspace, ThemeConfig, UserRole, Notification, Capability, MemberReference, Team, PulseLog, WorkspaceTask, WorkspaceIssue, WorkspaceDaily, WorkspaceFile, CapabilitySpec } from '@/types/domain';

interface AppState {
  user: User | null;
  organizations: Organization[];
  activeOrgId: string | null;
  workspaces: Workspace[];
  notifications: Notification[];
  pulseLogs: PulseLog[];
  capabilitySpecs: CapabilitySpec[];
  
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
      capabilitySpecs: [
        { id: 'files', name: '檔案空間', type: 'data', status: 'stable', description: '管理維度內的文檔與資產。' },
        { id: 'tasks', name: '原子任務', type: 'ui', status: 'stable', description: '追蹤空間內的行動目標。' },
        { id: 'qa', name: '品質檢驗', type: 'ui', status: 'stable', description: '檢核任務執行品質。' },
        { id: 'acceptance', name: '最終驗收', type: 'ui', status: 'stable', description: '驗收成果並結案。' },
        { id: 'issues', name: '議題追蹤', type: 'ui', status: 'stable', description: '處理技術衝突與異常。' },
        { id: 'daily', name: '每日動態', type: 'ui', status: 'stable', description: '極簡的技術協作日誌牆。' },
      ],

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
        get().addPulseLog({ actor: get().user?.name || 'System', action: '校準維度身分', target: updates.name || id, type: 'update' });
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
        get().addPulseLog({ actor: get().user?.name || 'System', action: '身分共振激活', target: member.name, type: 'create' });
      },

      removeOrgMember: (orgId, memberId) => set((state) => {
        const org = state.organizations.find(o => o.id === orgId);
        const member = org?.members.find(m => m.id === memberId);
        get().addPulseLog({ actor: get().user?.name || 'System', action: '身分註銷', target: member?.name || memberId, type: 'delete' });
        return {
          organizations: state.organizations.map(o => o.id === orgId ? {
            ...o,
            members: (o.members || []).filter(m => m.id !== memberId),
            teams: (o.teams || []).map(t => ({ ...t, memberIds: (t.memberIds || []).filter(mid => mid !== memberId) }))
          } : o)
        };
      }),

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
        get().addPulseLog({ actor: get().user?.name || 'System', action: '定義部門團隊', target: team.name, type: 'create' });
      },

      removeOrgTeam: (orgId, teamId) => set((state) => {
        const org = state.organizations.find(o => o.id === orgId);
        const team = org?.teams.find(t => t.id === teamId);
        get().addPulseLog({ actor: get().user?.name || 'System', action: '團隊架構移除', target: team?.name || teamId, type: 'delete' });
        return {
          organizations: state.organizations.map(o => o.id === orgId ? {
            ...o,
            teams: (o.teams || []).filter(t => t.id !== teamId)
          } : o)
        };
      }),

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
        get().addPulseLog({ actor: get().user?.name || 'System', action: '初始化邏輯空間', target: workspace.name, type: 'create' });
      },

      updateWorkspace: (id, updates) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === id ? { ...w, ...updates } : w)
        }));
        get().addPulseLog({ actor: get().user?.name || 'System', action: '校準空間規格', target: updates.name || id, type: 'update' });
      },

      deleteWorkspace: (id) => set((state) => {
        const ws = state.workspaces.find(w => w.id === id);
        get().addPulseLog({ actor: get().user?.name || 'System', action: '空間銷毀協議執行', target: ws?.name || id, type: 'delete' });
        return { workspaces: state.workspaces.filter(w => w.id !== id) };
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

      removeCapabilityFromWorkspace: (workspaceId, capabilityId) => set((state) => {
        const ws = state.workspaces.find(w => w.id === workspaceId);
        const cap = ws?.capabilities.find(c => c.id === capabilityId);
        get().addPulseLog({ actor: get().user?.name || 'System', action: '卸載原子能力', target: cap?.name || capabilityId, type: 'delete' });
        return {
          workspaces: state.workspaces.map(w => w.id === workspaceId ? {
            ...w,
            capabilities: (w.capabilities || []).filter(c => c.id !== capabilityId)
          } : w)
        };
      }),

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
          action: '切換團隊共振狀態', 
          target: ws?.name || workspaceId, 
          type: 'access' 
        });
      },

      addWorkspaceMember: (workspaceId, member) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === workspaceId ? {
            ...w,
            members: Array.from(new Set([...(w.members || []), member]))
          } : w)
        }));
        get().addPulseLog({ actor: get().user?.name || 'System', action: '授權空間存取', target: member.name, type: 'access' });
      },

      removeWorkspaceMember: (workspaceId, memberId) => {
        const ws = get().workspaces.find(w => w.id === workspaceId);
        const member = ws?.members.find(m => m.id === memberId);
        get().addPulseLog({ actor: get().user?.name || 'System', action: '撤銷空間存取', target: member?.name || memberId, type: 'access' });
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === workspaceId ? {
            ...w,
            members: (w.members || []).filter(m => m.id !== memberId)
          } : w)
        }));
      },

      addTaskToWorkspace: (workspaceId, task) => set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? {
          ...w,
          tasks: [...(w.tasks || []), { ...task, id: `task-${Date.now()}` }]
        } : w)
      })),

      updateTaskStatus: (workspaceId, taskId, status) => {
        const ws = get().workspaces.find(w => w.id === workspaceId);
        const task = ws?.tasks?.find(t => t.id === taskId);
        get().addPulseLog({ actor: get().user?.name || 'System', action: `更新任務狀態: ${status}`, target: task?.title || taskId, type: 'update' });
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === workspaceId ? {
            ...w,
            tasks: (w.tasks || []).map(t => t.id === taskId ? { ...t, status } : t)
          } : w)
        }));
      },

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
