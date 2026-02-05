"use client";

import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCards } from "./_components/stat-cards";
import { RecentContainers } from "./_components/recent-containers";
import { PermissionConstellation } from "./_components/permission-constellation";

export default function DashboardPage() {
  const { organizations, activeOrgId, containers } = useAppStore();
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  const orgContainers = containers.filter(c => c.orgId === activeOrgId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Organization Pulse" 
        description={activeOrg.context}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px] tracking-widest font-bold bg-primary/5">
              Dimension: {activeOrg.name}
            </Badge>
            {activeOrg.isExternal && (
              <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-accent/20 text-accent-foreground border-accent/30">
                External Resource
              </Badge>
            )}
          </div>
        }
      >
        <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border/50">
          <div className="flex flex-col items-center px-4 border-r">
            <span className="text-2xl font-bold font-headline">{orgContainers.length}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Containers</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-xs text-muted-foreground uppercase font-bold mb-1">Permission Level</span>
            <Badge className="font-headline">{activeOrg.role}</Badge>
          </div>
        </div>
      </PageHeader>

      <StatCards orgName={activeOrg.name} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentContainers containers={orgContainers} />
        <PermissionConstellation currentRole={activeOrg.role} />
      </div>
    </div>
  );
}
