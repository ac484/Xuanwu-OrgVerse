"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Clock, Box, Shield, Terminal, Zap } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useMemo } from "react";

/**
 * DimensionPulsePage - 職責：展示維度內的活動脈動日誌
 * 效能優化：記憶化日誌過濾邏輯，支持極速響應。
 */
export default function DimensionPulsePage() {
  const { pulseLogs, activeOrgId } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 效能優化：記憶化日誌過濾
  const filteredLogs = useMemo(() => 
    (pulseLogs || []).filter(log => log.orgId === activeOrgId),
    [pulseLogs, activeOrgId]
  );

  if (!mounted) return null;

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create': return <Zap className="w-3.5 h-3.5 text-green-500" />;
      case 'update': return <Activity className="w-3.5 h-3.5 text-primary" />;
      case 'delete': return <Shield className="w-3.5 h-3.5 text-destructive" />;
      default: return <Terminal className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="維度脈動日誌" 
        description="追蹤維度內所有技術規格、身分共振與空間治理的變動紀錄。"
      />

      <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] content-visibility-auto">
            <div className="divide-y divide-border/40">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-4">
                  <div className="p-2 bg-background rounded-lg border shadow-sm mt-1">
                    {getActionIcon(log.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <span className="text-muted-foreground font-normal">{log.actor}</span>
                        <span className="text-primary">{log.action}</span>
                        <span className="truncate max-w-[200px]">{log.target}</span>
                      </p>
                      <time className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {format(log.timestamp, "yyyy-MM-dd HH:mm:ss")}
                      </time>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-1.5 h-4">
                        PULSE_ID: {log.id.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-[8px] uppercase tracking-tighter px-1.5 h-4">
                        {log.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 opacity-30">
                  <Activity className="w-12 h-12" />
                  <p className="text-sm font-bold uppercase tracking-widest">尚無脈動共振</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
