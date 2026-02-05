"use client";

import { Container } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Box, Trash2 } from "lucide-react";

export function ContainerList({ containers }: { containers: Container[] }) {
  return (
    <div className="flex flex-col gap-3">
      {containers.map((container) => (
        <div key={container.id} className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:bg-muted/30 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/5 rounded-lg text-primary">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">{container.name}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-tighter">Type: {container.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sovereignty</p>
              <p className="text-xs font-medium">99.9% Isolated</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
