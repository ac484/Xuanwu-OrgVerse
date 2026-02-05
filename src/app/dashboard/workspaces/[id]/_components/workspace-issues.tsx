"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export function WorkspaceIssues() {
  const { workspace, emitEvent } = useWorkspace();
  const { addIssueToWorkspace } = useAppStore();

  const handleAddIssue = () => {
    const title = `技術規格衝突 #${Math.floor(Math.random() * 1000)}`;
    addIssueToWorkspace(workspace.id, { title, priority: 'high', status: 'open' });
    emitEvent("提交議題回報", title);
    toast({ title: "議題已提交" });
  };

  const issues = workspace.issues || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> 議題追蹤
        </h3>
        <Button size="sm" variant="outline" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-widest" onClick={handleAddIssue}>
          <Plus className="w-3 h-3" /> 提交議題
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {issues.map(issue => (
          <div key={issue.id} className="p-4 bg-card/40 border border-border/60 rounded-2xl hover:border-accent/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold">{issue.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="destructive" className="text-[8px] px-1.5 h-4 uppercase font-bold tracking-tighter">HIGH PRIORITY</Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">STATUS: {issue.status}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {issues.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-20">
            <p className="text-xs font-bold uppercase tracking-widest">目前無活躍議題</p>
          </div>
        )}
      </div>
    </div>
  );
}
