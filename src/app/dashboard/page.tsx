"use client";

import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCards } from "./_components/stat-cards";
import { RecentWorkspaces } from "./_components/recent-workspaces";
import { RecentOrganizations } from "./_components/recent-organizations";
import { PermissionConstellation } from "./_components/permission-constellation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, History, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * DashboardPage - 職責：維度脈動主控台
 */
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const organizations = useAppStore(state => state.organizations);
  const activeOrgId = useAppStore(state => state.activeOrgId);
  const workspaces = useAppStore(state => state.workspaces);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId) || organizations[0],
    [organizations, activeOrgId]
  );

  const orgWorkspaces = useMemo(() => 
    (workspaces || []).filter(w => w.orgId === activeOrgId),
    [workspaces, activeOrgId]
  );

  if (!mounted || !activeOrg) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <PageHeader 
        title="維度中心" 
        description="管理當前維度的架構狀態、節點演進與身份共振。"
        badge={
          <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px] tracking-widest font-bold bg-primary/5 px-2 py-1">
            當前維度: {activeOrg.name}
          </Badge>
        }
      >
        <div className="flex items-center gap-6 bg-muted/40 p-4 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
          <div className="text-center px-4 border-r border-border/50">
            <p className="text-2xl font-bold font-headline">{orgWorkspaces.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">空間節點</p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">主權級別</p>
            <Badge className="font-headline bg-primary/10 text-primary border-primary/20">{activeOrg.role}</Badge>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-24 rounded-3xl border-border/60 bg-card/50 hover:bg-primary/5 hover:border-primary/40 flex items-center justify-between px-8 group transition-all"
          onClick={() => router.push('/dashboard/organization/matrix')}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <Grid3X3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-bold font-headline">權限共振矩陣</p>
              <p className="text-xs text-muted-foreground">視覺化管理團隊與空間的授權映射。</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>

        <Button 
          variant="outline" 
          className="h-24 rounded-3xl border-border/60 bg-card/50 hover:bg-primary/5 hover:border-primary/40 flex items-center justify-between px-8 group transition-all"
          onClick={() => router.push('/dashboard/organization/audit')}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-bold font-headline">維度脈動日誌</p>
              <p className="text-xs text-muted-foreground">追蹤維度內所有的架構演進與數位紀錄。</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>

      <StatCards orgId={activeOrg.id} orgName={activeOrg.name} />

      <RecentOrganizations organizations={organizations} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentWorkspaces workspaces={orgWorkspaces} />
        <PermissionConstellation currentRole={activeOrg.role} />
      </div>
    </div>
  );
}
