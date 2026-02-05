
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Activity, Layers, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";

/**
 * StatCards - 職責：展示維度運行的動態指標
 * 已優化：數據指標與 Store 真實連動。
 */
export function StatCards({ orgName, workspaceCount }: { orgName: string, workspaceCount: number }) {
  const { pulseLogs } = useAppStore();
  
  // 動態計算指標
  const consistency = workspaceCount > 0 ? 100 : 0;
  const pulseRate = Math.min((pulseLogs.length / 20) * 100, 100);
  const capabilityLoad = workspaceCount * 3; // 模擬每個空間掛載的能力負擔

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
            當前維度 {orgName} 已掛載 {workspaceCount} 個獨立空間。
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-tighter">
              <span>環境一致性</span>
              <span>{consistency}%</span>
            </div>
            <Progress value={consistency} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">維度脈動強度</CardTitle>
          <Activity className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{pulseLogs.length > 5 ? '高頻交互中' : '穩態運行'}</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            近期的技術規格變動與身分共振頻率。
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-tighter">
              <span>活動共振率</span>
              <span>{Math.round(pulseRate)}%</span>
            </div>
            <Progress value={pulseRate} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">能力掛載負載</CardTitle>
          <Layers className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{capabilityLoad}% 資源佔用</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            維度內的原子能力規格對底層架構的壓力。
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
