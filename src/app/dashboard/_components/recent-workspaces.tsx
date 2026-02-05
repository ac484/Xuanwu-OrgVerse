"use client";

import { Workspace } from "@/types/domain";
import { ArrowUpRight, Terminal } from "lucide-react";
import { WorkspaceListItem } from "@/components/workspaces/workspace-list-item";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * RecentWorkspaces - 職責：展示最近使用的邏輯空間列表
 */
export function RecentWorkspaces({ workspaces }: { workspaces: Workspace[] }) {
  const router = useRouter();
  const recentOnes = workspaces.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-headline tracking-tight">最近使用的空間</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/dashboard/workspaces')}
          className="text-xs text-primary font-bold uppercase tracking-widest hover:bg-primary/5"
        >
          查看全隊 <ArrowUpRight className="ml-1 w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {recentOnes.length > 0 ? recentOnes.map(w => (
          <WorkspaceListItem key={w.id} workspace={w} />
        )) : (
          <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40">
            <Terminal className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">尚未建立邏輯空間節點。</p>
            <Button 
              variant="link"
              onClick={() => router.push('/dashboard/workspaces')}
              className="mt-2 text-xs font-bold text-primary uppercase tracking-widest"
            >
              + 建立首個節點
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}