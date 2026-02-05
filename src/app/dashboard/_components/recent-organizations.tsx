"use client";

import { Organization } from "@/types/domain";
import { Globe, ArrowUpRight } from "lucide-react";
import { OrganizationCard } from "@/components/organization/organization-card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * RecentOrganizations - 職責：展示用戶參與的最近維度列表。
 * 優化：路徑已同步至單數 organization。
 */
export function RecentOrganizations({ organizations }: { organizations: Organization[] }) {
  const router = useRouter();
  const recentOnes = organizations.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-headline tracking-tight">參與的維度</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/organization/settings')}
          className="text-xs text-primary font-bold uppercase tracking-widest hover:bg-primary/5"
        >
          治理中心 <ArrowUpRight className="ml-1 w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentOnes.length > 0 ? recentOnes.map(o => (
          <OrganizationCard key={o.id} organization={o} />
        )) : (
          <div className="col-span-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40">
            <Globe className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">尚未建立或加入任何維度。</p>
          </div>
        )}
      </div>
    </div>
  );
}
