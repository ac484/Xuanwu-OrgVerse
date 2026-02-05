"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Clock, User } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export function WorkspaceDaily() {
  const { workspace, emitEvent } = useWorkspace();
  const { addDailyLogToWorkspace, user } = useAppStore();
  const [content, setContent] = useState("");

  const handlePost = () => {
    if (!content.trim()) return;
    addDailyLogToWorkspace(workspace.id, { content, author: user?.name || "未知" });
    emitEvent("發佈每日動態", content.substring(0, 20) + "...");
    setContent("");
  };

  const logs = workspace.dailyLogs || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> 每日動態牆
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
        {logs.map(log => (
          <div key={log.id} className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                  {log.author[0]}
                </div>
                <span className="text-xs font-bold">{log.author}</span>
              </div>
              <time className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {format(log.timestamp, "HH:mm")}
              </time>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">{log.content}</p>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="p-12 text-center opacity-30 italic text-xs">
            今天還沒有任何動態更新。
          </div>
        )}
      </div>
    </div>
  );
}
