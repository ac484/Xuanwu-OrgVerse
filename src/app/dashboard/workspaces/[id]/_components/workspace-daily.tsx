"use client";

import { useWorkspace } from "../workspace-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { useAppStore } from "@/lib/store";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export function WorkspaceDaily() {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();
  const { user } = useAppStore();
  const [content, setContent] = useState("");

  // 原子優化：記憶化查詢引用，防止無效偵聽重啟
  const logsQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(
      collection(db, "workspaces", workspace.id, "dailyLogs"),
      orderBy("timestamp", "desc")
    );
  }, [db, workspace.id]);

  const { data: logs } = useCollection<any>(logsQuery);

  const handlePost = () => {
    if (!content.trim()) return;
    
    const logData = {
      content,
      author: user?.name || "未知人員",
      timestamp: serverTimestamp()
    };

    const logsCol = collection(db, "workspaces", workspace.id, "dailyLogs");
    addDoc(logsCol, logData)
      .then(() => {
        emitEvent("發佈每日動態", content.substring(0, 20) + "...");
        setContent("");
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: `workspaces/${workspace.id}/dailyLogs`,
          operation: 'create',
          requestResourceData: logData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> 每日動態牆 (Cloud Sync)
        </h3>
        <div className="relative">
          <Textarea 
            placeholder="寫下今天的技術進度或維度觀察..." 
            className="min-h-[100px] bg-card/40 border-border/60 rounded-2xl p-4 focus-visible:ring-primary/20"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button 
            size="sm" 
            className="absolute bottom-3 right-3 rounded-xl gap-2 font-bold uppercase text-[10px] tracking-widest"
            onClick={handlePost}
          >
            <Send className="w-3.5 h-3.5" /> 發佈
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {logs?.map(log => (
          <div key={log.id} className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                  {log.author?.[0] || 'U'}
                </div>
                <span className="text-xs font-bold">{log.author}</span>
              </div>
              <time className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> 
                {log.timestamp?.seconds ? format(log.timestamp.seconds * 1000, "HH:mm") : "同步中..."}
              </time>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">{log.content}</p>
          </div>
        ))}
        {(!logs || logs.length === 0) && (
          <div className="p-12 text-center opacity-30 italic text-xs">
            今天還沒有任何動態更新。
          </div>
        )}
      </div>
    </div>
  );
}
