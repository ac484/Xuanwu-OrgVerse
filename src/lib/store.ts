import { create } from 'zustand';
import { User, Organization, Workspace, Notification, CapabilitySpec, PulseLog } from '@/types/domain';

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
  
  // Data Sync
  setOrganizations: (orgs: Organization[]) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setPulseLogs: (logs: PulseLog[]) => void;
  
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  user: null,
  organizations: [],
  activeOrgId: null,
  workspaces: [],
  notifications: [],
  pulseLogs: [],
  capabilitySpecs: [
    { id: 'files', name: '檔案空間', type: 'data', status: 'stable', description: '管理維度內的文檔主權與技術資產。' },
    { id: 'tasks', name: '原子任務', type: 'ui', status: 'stable', description: '追蹤空間節點內的具體行動目標。' },
    { id: 'qa', name: '品質檢驗', type: 'ui', status: 'stable', description: '檢核原子數據執行品質的治理單元。' },
    { id: 'acceptance', name: '最終驗收', type: 'ui', status: 'stable', description: '驗收空間成果並終止 A 軌共振。' },
    { id: 'finance', name: '財務核算', type: 'ui', status: 'beta', description: '追蹤維度預算與驗收後的資金撥付。' },
    { id: 'issues', name: '議題追蹤', type: 'ui', status: 'stable', description: '處理技術衝突與 B 軌異常的治理模組。' },
    { id: 'daily', name: '每日動態', type: 'ui', status: 'stable', description: '極簡的空間技術協作脈動牆。' },
  ],

  login: (userData) => set({ user: userData }),
  
  logout: () => set({ 
    user: null, 
    organizations: [], 
    workspaces: [], 
    activeOrgId: null,
    notifications: [],
    pulseLogs: []
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
  
  setPulseLogs: (logs) => set({ pulseLogs: logs }),

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
