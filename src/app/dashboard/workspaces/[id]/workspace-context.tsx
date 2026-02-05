"use client";

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Workspace, Capability } from '@/types/domain';
import { useAppStore } from '@/lib/store';

/**
 * WorkspaceContext - 職責：定義邏輯空間內的共享邊界與事件總線
 */
interface WorkspaceContextType {
  workspace: Workspace;
  protocol: string;
  scope: string[];
  capabilities: Capability[];
  emitEvent: (action: string, detail: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ workspaceId, children }: { workspaceId: string, children: React.ReactNode }) {
  const { workspaces, addPulseLog, user } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  const emitEvent = useCallback((action: string, detail: string) => {
    if (!workspace) return;
    
    // 統一事件處理：將空間內的活動同步至維度脈動系統
    addPulseLog({
      actor: user?.name || 'Atomic Unit',
      action,
      target: `${workspace.name} > ${detail}`,
      type: 'event'
    });
  }, [workspace, addPulseLog, user]);

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
