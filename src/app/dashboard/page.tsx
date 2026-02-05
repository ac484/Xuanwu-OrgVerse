"use client";

import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCards } from "./_components/stat-cards";
import { RecentWorkspaces } from "./_components/recent-workspaces";
import { PermissionConstellation } from "./_components/permission-constellation";
import { useState, useEffect, useMemo } from "react";

/**
 * DashboardPage - 職責：維度脈動主控台
 * 優化點：全面使用精準選擇器與衍生狀態記憶化，確保極速響應。
 */
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  // 精準選擇器：僅訂閱維度清單、活動維度 ID 與空間列表
  const organizations = useAppStore(state => state.organizations);
  const activeOrgId = useAppStore(state => state.activeOrgId);
  const workspaces = useAppStore(state => state.workspaces);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 記憶化當前維度資料
  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId) || organizations[0],
    [organizations, activeOrgId]
  );

  // 記憶化當前維度的空間清單
  const orgWorkspaces = useMemo(() => 
    (workspaces || []).filter(w => w.orgId === activeOrgId),
    [workspaces, activeOrgId]
  );

  if (!mounted || !activeOrg) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <PageHeader 
        title="維度脈動" 
        description="管理當前維度的架構狀態與空間演進。"
        badge={
          <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px] tracking-widest font-bold bg-primary/5 px-2 py-1">
            當前維度: {activeOrg.name}
          </Badge>
        }
      >
        <div className="flex items-center gap-6 bg-muted/40 p-4 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
          <div className="text-center px-4 border-r border-border/50">
            <p className="text-2xl font-bold font-headline">{orgWorkspaces.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">邏輯空間</p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">主權級別</p>
            <Badge className="font-headline bg-primary/10 text-primary border-primary/20">{activeOrg.role}</Badge>
          </div>
        </div>
      </PageHeader>

      <StatCards orgId={activeOrg.id} orgName={activeOrg.name} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentWorkspaces workspaces={orgWorkspaces} />
        <PermissionConstellation currentRole={activeOrg.role} />
      </div>
    </div>
  );
}