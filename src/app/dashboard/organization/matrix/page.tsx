"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, ShieldAlert, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export default function PermissionMatrixPage() {
  const { organizations, activeOrgId, workspaces } = useAppStore();
  const { db } = useFirebase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId);
  if (!activeOrg) return null;

  const teams = activeOrg.teams || [];
  const orgWorkspaces = workspaces.filter(w => w.orgId === activeOrgId);

  const hasAccess = (teamId: string, workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    return ws?.teamIds?.includes(teamId) || false;
  };

  const handleToggleResonance = (wsId: string, teamId: string, wsName: string, teamName: string) => {
    const currentStatus = hasAccess(teamId, wsId);
    const wsRef = doc(db, "workspaces", wsId);
    
    const operation = currentStatus ? arrayRemove(teamId) : arrayUnion(teamId);
    const updates = { teamIds: operation };
    
    // 原子化更新與錯誤閉環
    updateDoc(wsRef, updates)
      .then(() => {
        toast({
          title: currentStatus ? "共振中斷" : "共振激活",
          description: currentStatus 
            ? `團隊 ${teamName} 已從空間 ${wsName} 撤回存取權。`
            : `團隊 ${teamName} 已成功掛載至空間 ${wsName}。`
        });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: wsRef.path,
          operation: 'update',
          requestResourceData: updates
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="權限共振矩陣" 
        description="視覺化展示各部門團隊與邏輯空間之間的映射關係，點擊交點可即時調整授權。"
      />

      <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[220px] text-[10px] font-bold uppercase tracking-widest py-6 px-6">團隊 \ 空間節點</TableHead>
              {orgWorkspaces.map(ws => (
                <TableHead key={ws.id} className="text-center min-w-[120px]">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-primary">{ws.name}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map(team => (
              <TableRow key={team.id} className="hover:bg-muted/5 transition-colors group">
                <TableCell className="font-bold py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-headline">{team.name}</span>
                      <span className="text-[9px] text-muted-foreground">{(team.memberIds || []).length} 名成員</span>
                    </div>
                  </div>
                </TableCell>
                {orgWorkspaces.map(ws => {
                  const access = hasAccess(team.id, ws.id);
                  return (
                    <TableCell 
                      key={ws.id} 
                      className="text-center p-0 cursor-pointer group/cell hover:bg-primary/5 transition-colors"
                      onClick={() => handleToggleResonance(ws.id, team.id, ws.name, team.name)}
                    >
                      <div className="flex items-center justify-center h-full min-h-[80px]">
                        {access ? (
                          <ShieldCheck className="w-5 h-5 text-green-500 animate-in zoom-in duration-300" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-muted-foreground opacity-10 group-hover/cell:opacity-40 transition-opacity" />
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
