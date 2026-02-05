"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Zap, Terminal, Shield, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { useFirebase } from "@/firebase/provider";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { cn } from "@/lib/utils";

/**
 * DimensionPulsePage - 職責：維度脈動日誌 (技術規格演進牆)
 */
export default function DimensionPulsePage() {
  const [mounted, setMounted] = useState(false);
  const { activeOrgId } = useAppStore();
  const { db } = useFirebase();

  useEffect(() => {
    setMounted(true);
  }, []);

  const pulseQuery = useMemo(() => {
    if (!activeOrgId || !db) return null;
    return query(
      collection(db, "organizations", activeOrgId, "pulseLogs"),
      orderBy("timestamp", "desc"),
      limit(100)
    );
  }, [activeOrgId, db]);

  const { data: logs } = useCollection<any>(pulseQuery);

  if (!mounted) return null;

  const getStatusTheme = (type: string) => {
    switch (type) {
      case 'create': return { icon: <Zap className="w-3.5 h-3.5" />, color: 'text-green-500', bg: 'bg-green-500/5', border: 'border-green-500/20' };
      case 'delete': return { icon: <Shield className="w-3.5 h-3.5" />, color: 'text-destructive', bg: 'bg-destructive/5', border: 'border-destructive/20' };
      case 'update': return { icon: <Activity className="w-3.5 h-3.5" />, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' };
      default: return { icon: <Terminal className="w-3.5 h-3.5" />, color: 'text-muted-foreground', bg: 'bg-muted/5', border: 'border-border/40' };
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <PageHeader 
        title="維度脈動日誌" 
        description="追蹤維度架構的所有演進。每一項紀錄均代表一次技術規格的共振與校準。"
      />

      {logs && logs.length > 0 ? (
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {logs.map((log) => {
            const theme = getStatusTheme(log.type);
            const safeId = String(log.id || "00000000");
            
            return (
              <div key={log.id} className="break-inside-avoid mb-6">
                <Card className={cn(
                  "border transition-all duration-300 group hover:shadow-md rounded-2xl overflow-hidden",
                  theme.bg, theme.border
                )}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg bg-background border shadow-sm", theme.color)}>
                          {theme.icon}
                        </div>
                        <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-tighter border-none px-0", theme.color)}>
                          {log.type}
                        </Badge>
                      </div>
                      <time className="text-[9px] text-muted-foreground font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp?.seconds 
                          ? format(log.timestamp.seconds * 1000, "HH:mm:ss") 
                          : "SYNCING"}
                      </time>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <span className="text-foreground">{log.actor}</span>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span className={theme.color}>{log.action}</span>
                      </p>
                      <p className="text-sm font-black tracking-tight line-clamp-2">
                        {log.target}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/10 flex items-center justify-between">
                      <span className="text-[8px] font-mono text-muted-foreground/60 uppercase">
                        Pulse_Ref: {safeId.slice(-8).toUpperCase()}
                      </span>
                      <div className="flex gap-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", theme.color.replace('text', 'bg'))} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-32 text-center flex flex-col items-center justify-center space-y-4 opacity-30">
          <Terminal className="w-12 h-12" />
          <p className="text-sm font-black uppercase tracking-widest">目前無任何技術規格變動紀錄</p>
        </div>
      )}
    </div>
  );
}