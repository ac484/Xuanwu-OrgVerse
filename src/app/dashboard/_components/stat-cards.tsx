"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Activity, Layers, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * StatCards - 職責：負責展示組織的核心指標資料
 */
export function StatCards({ orgName }: { orgName: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">邏輯主權</CardTitle>
          <ShieldCheck className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">絕對隔離</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            數據嚴格分層於 {orgName} 邊界內。
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-tighter">
              <span>加密完整性</span>
              <span>99.9%</span>
            </div>
            <Progress value={99.9} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">維度共振</CardTitle>
          <Activity className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">活躍串流</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            當前端點間的即時協作狀態。
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
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">成長向量</CardTitle>
          <Layers className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">+12% 已建立</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            相較於上個週期的基準擴張。
          </p>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4 fill-primary" />
            <span className="text-[10px] font-bold uppercase tracking-tight">閃電存取已激活</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
