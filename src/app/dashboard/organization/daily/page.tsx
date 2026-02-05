
"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, MapPin, ExternalLink, User, Zap } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { useFirebase } from "@/firebase/provider";
import { collectionGroup, query, where, orderBy, limit } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * DimensionDailyPage - 職責：維度層級的「瀑布流」動態牆 (Firestagram 邏輯超越版)
 * 優化：使用 CSS 多欄佈局實現極簡且高效的 Masonry 效果。
 */
export default function DimensionDailyPage() {
  const [mounted, setMounted] = useState(false);
  const { activeOrgId } = useAppStore();
  const { db } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const globalDailyQuery = useMemo(() => {
    if (!activeOrgId || !db) return null;
    return query(
      collectionGroup(db, "dailyLogs"),
      where("orgId", "==", activeOrgId),
      orderBy("timestamp", "desc"),
      limit(50)
    );
  }, [activeOrgId, db]);

  const { data: logs, loading } = useCollection<any>(globalDailyQuery);

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <PageHeader 
        title="維度動態牆" 
        description="全域空間的技術脈動聚合。採用瀑布流佈局實時呈現維度內的每日演進。"
      />

      {logs && logs.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="break-inside-avoid mb-6 group">
              <Card className="border-border/60 bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-xl rounded-3xl overflow-hidden relative border-l-4 border-l-primary/20">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-4 h-4 text-primary animate-pulse" />
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shadow-inner">
                        {log.author?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">{log.author}</p>
                        <time className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {log.timestamp?.seconds 
                            ? format(log.timestamp.seconds * 1000, "MMM d, HH:mm") 
                            : "正在共振..."}
                        </time>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <p className="text-sm leading-relaxed text-foreground/90 font-medium italic pl-4 border-l-2 border-primary/10">
                      "{log.content}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] h-5 gap-1 bg-background/50 border-primary/20 text-primary font-black uppercase tracking-tighter">
                      <MapPin className="w-2.5 h-2.5" /> {log.workspaceName || "獨立空間"}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      onClick={() => router.push(`/dashboard/workspaces/${log.workspaceId}`)}
                    >
                      進入共振 <ExternalLink className="ml-1 w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-32 text-center flex flex-col items-center justify-center space-y-6 opacity-30">
          <div className="p-6 bg-muted/20 rounded-full border-2 border-dashed">
            <MessageSquare className="w-16 h-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold uppercase tracking-[0.2em]">維度虛無中</p>
            <p className="text-xs font-medium">當空間成員開始發佈技術動態，此牆面將會啟動共振。</p>
          </div>
        </div>
      )}
    </div>
  );
}
