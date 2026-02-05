"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Users, Layers, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

/**
 * PermissionMatrixPage - 職責：權限共振矩陣
 * 實作交互授權邏輯：點擊交點即可切換團隊與工作空間的關聯。
 */
export default function PermissionMatrixPage() {
  const { organizations, activeOrgId, workspaces, toggleTeamAccessToWorkspace } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId);
  if (!activeOrg) return null;

  const teams = activeOrg.teams || [];
  const orgWorkspaces = workspaces.filter(w => w.orgId === activeOrgId);

  // 判斷特定團隊是否與工作空間有「共振關係」
  const hasAccess = (teamId: string, workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    return ws?.teamIds?.includes(teamId) || false;
  };

  const handleToggleResonance = (wsId: string, teamId: string, wsName: string, teamName: string) => {
    const currentStatus = hasAccess(teamId, wsId);
    toggleTeamAccessToWorkspace(wsId, teamId);
    
    toast({
      title: currentStatus ? "共振中斷" : "共振激活",
      description: currentStatus 
        ? `團隊 ${teamName} 已從空間 ${wsName} 撤回存取權。`
        : `團隊 ${teamName} 已成功掛載至空間 ${wsName}。`,
      variant: currentStatus ? "default" : "default"
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
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-tight text-primary">{ws.name}</span>
                    <Badge variant="outline" className="text-[8px] h-3.5 font-mono px-1 opacity-60">
                      {ws.id.toUpperCase()}
                    </Badge>
                  </div>
                </TableHead>
              ))}
              {orgWorkspaces.length === 0 && (
                <TableHead className="text-muted-foreground italic text-xs">尚無活躍空間</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map(team => (
              <TableRow key={team.id} className="hover:bg-muted/5 transition-colors group">
                <TableCell className="font-bold py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-headline">{team.name}</span>
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{(team.memberIds || []).length} 名成員</span>
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
                          <div className="flex flex-col items-center gap-1.5 animate-in zoom-in duration-300">
                            <div className="p-2 bg-green-500/10 rounded-full">
                              <ShieldCheck className="w-5 h-5 text-green-500" />
                            </div>
                            <Badge variant="outline" className="text-[7px] h-3.5 bg-green-500/5 text-green-600 border-green-500/20 uppercase font-bold tracking-tighter">已共振</Badge>
                          </div>
                        ) : (
                          <div className="opacity-10 group-hover/cell:opacity-40 transition-opacity">
                            <ShieldAlert className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={orgWorkspaces.length + 1} className="h-48 text-center text-muted-foreground italic">
                  <div className="flex flex-col items-center gap-3">
                    <Layers className="w-10 h-10 opacity-10" />
                    <p className="text-xs font-bold uppercase tracking-widest">請先建立部門團隊以生成共振矩陣</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4 fill-primary" />
            <h4 className="text-xs font-bold uppercase tracking-widest">矩陣交互指引</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            矩陣交點代表團隊與空間的「共振狀態」。點擊交點即可切換存取授權，系統將自動同步相關成員的維度存取權限。
          </p>
        </div>
        <div className="p-5 bg-card border border-border/60 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">治理建議</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            建議實施「最小授權原則」，僅對必要共振的團隊開啟空間權限。隱藏模式下的空間依然會出現在此矩陣中以便於進行主權配置。
          </p>
        </div>
      </div>
    </div>
  );
}
