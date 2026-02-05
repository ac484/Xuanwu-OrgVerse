"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, MessageSquare, ArrowRight, ShieldAlert, GitBranch } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export function WorkspaceIssues() {
  const { workspace, emitEvent, protocol } = useWorkspace();
  const { addIssueToWorkspace } = useAppStore();

  const handleAddIssue = () => {
    const title = `技術規格衝突 #${Math.floor(Math.random() * 1000)}`;
    addIssueToWorkspace(workspace.id, { title, priority: 'high', status: 'open' });
    emitEvent("B 軌激活", `提交異常議題: ${title}`);
    toast({ title: "B 軌議題已提交", description: "該異常已進入維度治理範疇。" });
  };

  const issues = workspace.issues || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-accent" /> B 軌：異常與衝突追蹤
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[8px] h-4 border-accent/20 bg-accent/5 text-accent font-mono uppercase">
              PROTOCOL: {protocol || "STANDARD"}
            </Badge>
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-widest border-accent/20 text-accent hover:bg-accent/5" onClick={handleAddIssue}>
          <Plus className="w-3 h-3" /> 提交衝突
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {issues.map(issue => (
          <div key={issue.id} className="p-4 bg-card/40 border-l-4 border-l-accent border border-border/60 rounded-r-2xl hover:bg-accent/5 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{issue.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="destructive" className="text-[8px] px-1.5 h-4 uppercase font-bold tracking-tighter bg-accent/10 text-accent border-accent/20">BLOCKER</Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">狀態: {issue.status}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-accent">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {issues.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-20 border-accent/20">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">目前 B 軌運行平穩，無活躍衝突</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
        <div className="flex items-center gap-2 text-accent mb-2">
          <GitBranch className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">B 軌治理準則 (Anomaly Track)</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          基於當前協議 「{protocol || "預設存取協議"}」，當 A 軌（正向生產鏈）遭遇 QA 駁回或驗收不通過時，應在此處建立關聯議題。所有的 A 軌結案都必須以 B 軌的清空為前提。
        </p>
      </div>
    </div>
  );
}
