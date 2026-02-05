"use client";

import { Container } from "@/types/domain";
import { Layers, ArrowUpRight } from "lucide-react";
import { ContainerListItem } from "@/components/dashboard/containers/container-list-item";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * RecentContainers - 職責：展示最近使用的容器列表，並提供捷徑
 */
export function RecentContainers({ containers }: { containers: Container[] }) {
  const router = useRouter();
  const recentOnes = containers.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-headline tracking-tight">Recent Containers</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/dashboard/containers')}
          className="text-xs text-primary font-bold uppercase tracking-widest hover:bg-primary/5"
        >
          View Fleet <ArrowUpRight className="ml-1 w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {recentOnes.length > 0 ? recentOnes.map(c => (
          <ContainerListItem key={c.id} container={c} />
        )) : (
          <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40">
            <Layers className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">No logical containers established yet.</p>
            <Button 
              variant="link"
              onClick={() => router.push('/dashboard/containers')}
              className="mt-2 text-xs font-bold text-primary uppercase tracking-widest"
            >
              + Forge First Container
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
