"use client";

import { Container } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, Trash2, ArrowUpRight } from "lucide-react";

interface ContainerListItemProps {
  container: Container;
  onDelete?: (id: string) => void;
}

export function ContainerListItem({ container, onDelete }: ContainerListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:bg-muted/30 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/5 rounded-lg text-primary">
          <Box className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{container.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter px-1.5 h-4">
              {container.type}
            </Badge>
            <span className="text-[10px] text-muted-foreground">ID: {container.id}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Status</p>
          <p className="text-[11px] font-medium">99.9% Isolated</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <ArrowUpRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(container.id); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
