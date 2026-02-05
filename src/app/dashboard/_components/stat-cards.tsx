"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Activity, Layers, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function StatCards({ orgName }: { orgName: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Logical Sovereignty</CardTitle>
          <ShieldCheck className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Absolute Isolation</div>
          <p className="text-xs text-muted-foreground mt-1">
            Data strictly layered within {orgName} boundaries.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold">
              <span>Encryption Integrity</span>
              <span>99.9%</span>
            </div>
            <Progress value={99.9} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Dimension Resonance</CardTitle>
          <Activity className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Active Stream</div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time collaboration across active endpoints.
          </p>
          <div className="flex items-center gap-1 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                U{i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
              +12
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Container Growth</CardTitle>
          <Layers className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12% Established</div>
          <p className="text-xs text-muted-foreground mt-1">
            Expansion from last cycle benchmarks.
          </p>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4 fill-primary" />
            <span className="text-xs font-bold uppercase tracking-tight">Lightning Access Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
