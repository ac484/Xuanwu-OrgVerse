"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Activity, Layers, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { useMemo } from "react";

/**
 * StatCards - 職責：展示維度運行的動態指標
 * 效能優化：極致記憶化所有複雜運算，並加入 isFinite 防禦除以零的崩潰。
 */
export function StatCards({ orgId, orgName }: { orgId: string, orgName: string }) {
  const { pulseLogs, workspaces } = useAppStore();
  
  const safeWorkspaces = useMemo(() => workspaces || [], [workspaces]);
  const safePulseLogs = useMemo(() => pulseLogs || [], [pulseLogs]);

  const orgWorkspaces = useMemo(() => 
    safeWorkspaces.filter(w => w.orgId === orgId),
    [safeWorkspaces, orgId]
  );
  
  // 記憶化：計算環境一致性 (基於 Protocol 的多樣性)
  // 防禦性：若 uniqueProtocols 為 0，val 為 Infinity，需強制轉為合法數值。
  const consistency = useMemo(() => {
    if (orgWorkspaces.length === 0) return 100;
    const protocols = orgWorkspaces.map(w => w.protocol || 'Default');
    const uniqueProtocols = new Set(protocols);
    const val = Math.round((1 / uniqueProtocols.size) * 100);
    return isFinite(val) ? val : 100;
  }, [orgWorkspaces]);

  // 記憶化：計算脈動率
  const pulseRate = useMemo(() => {
    const recentPulseCount = safePulseLogs.filter(l => l.orgId === orgId).length;
    const val = (recentPulseCount / 20) * 100;
    return isFinite(val) ? Math.min(val, 100) : 0;
  }, [safePulseLogs, orgId]);

  // 記憶化：計算能力負載
  const capabilityLoad = useMemo(() => {
    const totalCapabilities = orgWorkspaces.reduce((acc, w) => acc + (w.capabilities?.length || 0), 0);
    const val = totalCapabilities * 10;
    return isFinite(val) ? Math.min(val, 100) : 0;
  }, [orgWorkspaces]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 gpu-accelerated">
      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">維度一致性</CardTitle>
          <ShieldCheck className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{consistency}% 協議對齊</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            當前維度 {orgName} 已掛載 {orgWorkspaces.length} 個空間節點。
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-tighter">
              <span>環境共振率</span>
              <span>{consistency}%</span>
            </div>
            <Progress value={consistency} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">活動脈動</CardTitle>
          <Activity className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{pulseRate > 50 ? '高頻交互' : '穩態運行'}</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            近期的技術規格變動與身分共振頻率。
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-tighter">
              <span>即時活絡度</span>
              <span>{Math.round(pulseRate)}%</span>
            </div>
            <Progress value={pulseRate} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">能力掛載負載</CardTitle>
          <Layers className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{capabilityLoad}% 資源佔用</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            維度內的原子能力堆疊對底層架構的壓力。
          </p>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4 fill-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-tight text-primary">AI 效能優化已激活</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}