"use client";

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Workspace, Capability, PulseLog } from '@/types/domain';
import { useAppStore } from '@/lib/store';
import { useFirebase } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface WorkspaceContextType {
  workspace: Workspace;
  protocol: string;
  scope: string[];
  capabilities: Capability[];
  localPulse: PulseLog[];
  emitEvent: (action: string, detail: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ workspaceId, children }: { workspaceId: string, children: React.ReactNode }) {
  const { workspaces, user, activeOrgId, pulseLogs } = useAppStore();
  const { db } = useFirebase();
  
  const workspace = useMemo(() => 
    workspaces.find(w => w.id === workspaceId), 
    [workspaces, workspaceId]
  );

  // 原子化最佳化：將空間脈動的過濾邏輯封裝在 Context 中
  const localPulse = useMemo(() => 
    (pulseLogs || []).filter(log => log.workspaceId === workspaceId),
    [pulseLogs, workspaceId]
  );

  const emitEvent = useCallback((action: string, detail: string) => {
    if (!workspace || !activeOrgId) return;
    
    const logData = {
      actor: user?.name || 'Atomic Unit',
      action,
      target: `${workspace.name} > ${detail}`,
      type: 'event',
      timestamp: serverTimestamp(),
      orgId: activeOrgId,
      workspaceId: workspace.id // 關鍵修復：確保日誌帶有空間 ID
    };

    const pulseCol = collection(db, "organizations", activeOrgId, "pulseLogs");
    addDoc(pulseCol, logData)
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: `organizations/${activeOrgId}/pulseLogs`,
          operation: 'create',
          requestResourceData: logData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  }, [workspace, user, activeOrgId, db]);

  const value = useMemo(() => {
    if (!workspace) return null;
    return {
      workspace,
      protocol: workspace.protocol,
      scope: workspace.scope,
      capabilities: workspace.capabilities || [],
      localPulse,
      emitEvent
    };
  }, [workspace, localPulse, emitEvent]);

  if (!value) return null;

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
