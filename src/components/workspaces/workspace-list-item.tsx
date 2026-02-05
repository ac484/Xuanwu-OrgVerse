"use client";

import { Workspace } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkspaceListItemProps {
  workspace: Workspace;
  onDelete?: (id: string) => void;
}

export function WorkspaceListItem({ workspace, onDelete }: WorkspaceListItemProps) {
  const router = useRouter();

  return (
    <div 
      className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:bg-muted/30 transition-colors group cursor-pointer"
      onClick={() => router.push(`/dashboard/workspaces/${workspace.id}`)}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/5 rounded-lg text-primary">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{workspace.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter px-1.5 h-4 flex items-center gap-1">
              {workspace.visibility === 'visible' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {workspace.visibility === 'visible' ? '顯示' : '隱藏'}
            </Badge>
            <span className="text-[10px] text-muted-foreground">ID: {workspace.id.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">存取協議</p>
          <p className="text-[11px] font-medium">{workspace.protocol || '預設協議'}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <ArrowUpRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(workspace.id); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
