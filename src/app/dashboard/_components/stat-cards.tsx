"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Activity, Layers, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * StatCards - 職責：展示維度運行的動態指標
 */
export function StatCards({ orgName, workspaceCount }: { orgName: string, workspaceCount: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">維度主權</CardTitle>
          <ShieldCheck className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">空間隔離已部署</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            當前維度 {orgName} 已成功掛載 {workspaceCount} 個獨立空間。
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-tighter">
              <span>環境一致性</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">空間共振脈動</CardTitle>
          <Activity className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">身分同步活耀</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            此維度下所有邏輯空間的通訊狀態保持穩定。
          </p>
          <div className="flex items-center gap-1 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                U{i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
              +
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">能力增長</CardTitle>
          <Layers className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">原子能力掛載中</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            維度內的技術規格正根據架構描述自動演進。
          </p>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4 fill-primary" />
            <span className="text-[10px] font-bold uppercase tracking-tight">AI 輔助適配已啟用</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
