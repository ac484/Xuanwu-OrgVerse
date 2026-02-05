import { create } from 'zustand';
import { User, Organization, Workspace, ThemeConfig, UserRole, Notification, Capability, MemberReference, Team, PulseLog, WorkspaceTask, WorkspaceIssue, WorkspaceDaily, WorkspaceFile, CapabilitySpec } from '@/types/domain';

interface AppState {
  user: User | null;
  organizations: Organization[];
  activeOrgId: string | null;
  workspaces: Workspace[];
  notifications: Notification[];
  pulseLogs: PulseLog[];
  capabilitySpecs: CapabilitySpec[];
  
  // Actions
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setActiveOrg: (id: string) => void;
  
  // Data Sync (Local State Management for UI Responsiveness)
  setOrganizations: (orgs: Organization[]) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  
  // These will now trigger Firestore writes in the components, 
  // but we keep the store for global UI state
  addPulseLog: (log: Omit<PulseLog, 'id' | 'timestamp' | 'orgId'>) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

// 注意：我們移除了 persist 中間件，確保資料不跨帳號殘留
export const useAppStore = create<AppState>()((set, get) => ({
  user: null,
  organizations: [],
  activeOrgId: null,
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
  
  logout: () => set({ 
    user: null, 
    organizations: [], 
    workspaces: [], 
    activeOrgId: null,
    pulseLogs: [],
    notifications: []
  }),

  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),

  setActiveOrg: (id) => set({ activeOrgId: id }),
  
  setOrganizations: (orgs) => set({ 
    organizations: orgs,
    activeOrgId: get().activeOrgId || (orgs.length > 0 ? orgs[0].id : null)
  }),

  setWorkspaces: (workspaces) => set({ workspaces }),

  addPulseLog: (log) => set((state) => ({
    pulseLogs: [{
      ...log,
      id: `pulse-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      orgId: state.activeOrgId || 'personal'
    }, ...state.pulseLogs].slice(0, 50)
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
}));
