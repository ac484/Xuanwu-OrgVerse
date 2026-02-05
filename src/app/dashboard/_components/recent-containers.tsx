"use client";

import { Container } from "@/types/domain";
import { Layers, ArrowUpRight } from "lucide-react";
import { ContainerListItem } from "@/components/dashboard/containers/container-list-item";
import { useRouter } from "next/navigation";

export function RecentContainers({ containers }: { containers: Container[] }) {
  const router = useRouter();
  const recentOnes = containers.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-headline">Recent Containers</h2>
        <button 
          onClick={() => router.push('/dashboard/containers')}
          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {recentOnes.length > 0 ? recentOnes.map(c => (
          <ContainerListItem key={c.id} container={c} />
        )) : (
          <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-muted/5">
            <Layers className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">No logical containers established yet.</p>
            <button 
              onClick={() => router.push('/dashboard/containers')}
              className="mt-4 text-xs font-bold text-primary uppercase tracking-widest hover:underline"
            >
              + Forge First Container
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
