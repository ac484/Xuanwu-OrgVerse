
"use client";

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Workspace, Capability } from '@/types/domain';
import { useAppStore } from '@/lib/store';
import { useFirebase } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface WorkspaceContextType {
  workspace: Workspace;
  protocol: string;
  scope: string[];
  capabilities: Capability[];
  emitEvent: (action: string, detail: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ workspaceId, children }: { workspaceId: string, children: React.ReactNode }) {
  const { workspaces, user, activeOrgId } = useAppStore();
  const { db } = useFirebase();
  
  const workspace = useMemo(() => 
    workspaces.find(w => w.id === workspaceId), 
    [workspaces, workspaceId]
  );

  const emitEvent = useCallback((action: string, detail: string) => {
    if (!workspace || !activeOrgId) return;
    
    const logData = {
      actor: user?.name || 'Atomic Unit',
      action,
      target: `${workspace.name} > ${detail}`,
      type: 'event',
      timestamp: serverTimestamp(),
      orgId: activeOrgId
    };

    // 真正的雲端審計日誌寫入
    const pulseCol = collection(db, "organizations", activeOrgId, "pulseLogs");
    addDoc(pulseCol, logData)
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: `organizations/${activeOrgId}/pulseLogs`,
          operation: 'create',
          requestResourceData: logData
        });
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
      emitEvent
    };
  }, [workspace, emitEvent]);

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
