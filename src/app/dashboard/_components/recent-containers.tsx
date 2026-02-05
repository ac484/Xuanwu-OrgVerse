"use client";

import { Container } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Package, Layers, ArrowUpRight } from "lucide-react";

export function RecentContainers({ containers }: { containers: Container[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-headline">Recent Containers</h2>
        <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {containers.length > 0 ? containers.map(c => (
          <div key={c.id} className="p-4 bg-card border border-border/60 rounded-xl flex items-center justify-between hover:bg-muted/30 transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-lg text-primary">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground">Type: {c.type}</p>
              </div>
            </div>
            <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">Open</Badge>
          </div>
        )) : (
          <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center">
            <Layers className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">No logical containers established yet.</p>
            <button className="mt-4 text-xs font-bold text-primary uppercase tracking-widest hover:underline">+ Forge First Container</button>
          </div>
        )}
      </div>
    </div>
  );
}
