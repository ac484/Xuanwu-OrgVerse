
"use client";

import { useWorkspace } from "../../workspace-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Clock, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { useAppStore } from "@/lib/store";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

/**
 * WorkspaceDaily - 職責：空間專屬動態牆 (Firestagram 輕量化單空間版)
 */
export function WorkspaceDaily() {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();
  const { user, activeOrgId } = useAppStore();
  const [content, setContent] = useState("");

  const logsQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(
      collection(db, "workspaces", workspace.id, "dailyLogs"),
      orderBy("timestamp", "desc")
    );
  }, [db, workspace.id]);

  const { data: logs } = useCollection<any>(logsQuery);

  const handlePost = () => {
    if (!content.trim() || !activeOrgId) return;
    
    const logData = {
      content,
      author: user?.name || "未知人員",
      timestamp: serverTimestamp(),
      orgId: activeOrgId,
      workspaceId: workspace.id,
      workspaceName: workspace.name
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-[2.5rem] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">同步今日進度</h3>
        </div>
        <div className="relative">
          <Textarea 
            placeholder="今天完成了哪些技術共振？" 
            className="min-h-[120px] bg-transparent border-none focus-visible:ring-0 p-0 text-base resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              發佈為: <span className="text-foreground font-bold">{user?.name}</span>
            </p>
            <Button 
              size="sm" 
              className="rounded-full gap-2 font-black uppercase text-[10px] px-6 shadow-lg shadow-primary/20"
              onClick={handlePost}
              disabled={!content.trim()}
            >
              <Send className="w-3.5 h-3.5" /> 發佈動態
            </Button>
          </div>
        </div>
      </div>

      <div className="columns-1 gap-6 space-y-6">
        {logs?.map(log => (
          <div key={log.id} className="break-inside-avoid">
            <div className="p-6 bg-muted/20 border border-border/40 rounded-3xl space-y-4 hover:border-primary/30 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black border border-primary/20">
                    {log.author?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-bold">{log.author}</span>
                </div>
                <time className="text-[9px] text-muted-foreground flex items-center gap-1 font-mono uppercase">
                  <Clock className="w-3 h-3" /> 
                  {log.timestamp?.seconds ? format(log.timestamp.seconds * 1000, "HH:mm") : "共振中"}
                </time>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80 font-medium italic">"{log.content}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
