"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Users, Layers } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * PermissionMatrixPage - 職責：權限共振矩陣
 * 提供團隊 (Teams) 與工作空間 (Workspaces) 之間的存取權視覺化映射。
 */
export default function PermissionMatrixPage() {
  const { organizations, activeOrgId, workspaces } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId);
  if (!activeOrg) return null;

  const teams = activeOrg.teams || [];
  const orgWorkspaces = workspaces.filter(w => w.orgId === activeOrgId);

  // 計算特定團隊是否與工作空間有「交集成員」
  const hasAccess = (teamId: string, workspaceId: string) => {
    const teamMemberIds = teams.find(t => t.id === teamId)?.memberIds || [];
    const workspaceMemberIds = workspaces.find(w => w.id === workspaceId)?.members.map(m => m.id) || [];
    return teamMemberIds.some(id => workspaceMemberIds.includes(id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="權限共振矩陣" 
        description="視覺化展示各部門團隊與邏輯空間之間的映射關係，確保技術邊界的合規性。"
      />

      <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[200px] text-[10px] font-bold uppercase tracking-widest">團隊 \ 工作空間</TableHead>
              {orgWorkspaces.map(ws => (
                <TableHead key={ws.id} className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-tight">{ws.name}</span>
                    <span className="text-[8px] text-muted-foreground font-mono">{ws.id.slice(-4).toUpperCase()}</span>
                  </div>
                </TableHead>
              ))}
              {orgWorkspaces.length === 0 && (
                <TableHead className="text-muted-foreground italic text-xs">尚無活躍工作空間</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map(team => (
              <TableRow key={team.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="font-bold">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm">{team.name}</span>
                  </div>
                </TableCell>
                {orgWorkspaces.map(ws => {
                  const access = hasAccess(team.id, ws.id);
                  return (
                    <TableCell key={ws.id} className="text-center">
                      <div className="flex justify-center">
                        {access ? (
                          <div className="flex flex-col items-center gap-1 group">
                            <ShieldCheck className="w-5 h-5 text-green-500 animate-in zoom-in duration-300" />
                            <Badge variant="outline" className="text-[7px] h-3 bg-green-500/5 text-green-600 border-green-500/20">已共振</Badge>
                          </div>
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-muted-foreground/20" />
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={orgWorkspaces.length + 1} className="h-40 text-center text-muted-foreground italic">
                  <div className="flex flex-col items-center gap-2">
                    <Layers className="w-8 h-8 opacity-20" />
                    <p className="text-xs">請先在「部門團隊」中建立分組以生成矩陣。</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">矩陣解析說明</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            當團隊中至少有一名成員被授予特定工作空間的存取權時，系統將判定為「已共振」。這表示該團隊的能力範疇已延伸至該空間。
          </p>
        </div>
        <div className="p-4 bg-muted/30 border border-border/60 rounded-xl space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-widest">安全建議</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            建議定期查閱此矩陣，確保非技術團隊（如行銷部）不會意外共振到敏感的核心解析空間。
          </p>
        </div>
      </div>
    </div>
  );
}
