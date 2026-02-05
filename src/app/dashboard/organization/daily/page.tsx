"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { useFirebase } from "@/firebase/provider";
import { collectionGroup, query, where, orderBy, limit } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * DimensionDailyPage - 職責：聚合所有空間的每日動態 (動態牆)
 * 使用集合組查詢 (Collection Group Query) 實現全域監控。
 */
export default function DimensionDailyPage() {
  const [mounted, setMounted] = useState(false);
  const { activeOrgId } = useAppStore();
  const { db } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 全域聚合：查詢所有空間下的 dailyLogs 子集合
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
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="維度動態牆" 
        description="聚合當前維度下所有空間節點的實時技術動態與每日日誌。"
      />

      <div className="space-y-6 relative before:absolute before:left-8 before:top-4 before:bottom-0 before:w-px before:bg-border/60">
        {logs && logs.length > 0 ? logs.map((log) => (
          <div key={log.id} className="relative pl-16">
            {/* 時間軸節點 */}
            <div className="absolute left-6 top-2 w-4 h-4 rounded-full border-4 border-background bg-primary shadow-sm z-10" />
            
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all group overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                      {log.author?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{log.author}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[9px] h-4 flex items-center gap-1 bg-background/50 border-primary/20 text-primary">
                          <MapPin className="w-2.5 h-2.5" /> {log.workspaceName || "未知空間"}
                        </Badge>
                        <time className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.timestamp?.seconds 
                            ? format(log.timestamp.seconds * 1000, "yyyy-MM-dd HH:mm") 
                            : "同步中..."}
                        </time>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
                    onClick={() => router.push(`/dashboard/workspaces/${log.workspaceId}`)}
                  >
                    進入空間 <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>

                <div className="pl-12">
                  <p className="text-sm leading-relaxed text-foreground/80 bg-muted/30 p-4 rounded-2xl italic border-l-4 border-primary/30">
                    "{log.content}"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )) : (
          <div className="p-24 text-center flex flex-col items-center justify-center space-y-4 opacity-30">
            <MessageSquare className="w-16 h-16" />
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest">
                {loading ? "正在同步全域動態..." : "尚無動態共振"}
              </p>
              <p className="text-[10px]">當空間成員發佈每日動態時，將會顯示於此。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}