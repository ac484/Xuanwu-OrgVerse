"use client";

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Workspace, Capability } from '@/types/domain';
import { useAppStore } from '@/lib/store';

/**
 * WorkspaceContext - 職責：定義邏輯空間內的共享邊界與事件總線
 * 效能優化：使用 useMemo 穩定上下文數值，避免子組件不必要的重新渲染。
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
  
  // 使用 useMemo 尋找 Workspace，減少查詢次數
  const workspace = useMemo(() => 
    workspaces.find(w => w.id === workspaceId), 
    [workspaces, workspaceId]
  );

  const emitEvent = useCallback((action: string, detail: string) => {
    if (!workspace) return;
    
    addPulseLog({
      actor: user?.name || 'Atomic Unit',
      action,
      target: `${workspace.name} > ${detail}`,
      type: 'event'
    });
  }, [workspace, addPulseLog, user]);

  // 核心效能優化：鎖定 Provider Value
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
