"use client";

import { useWorkspace } from "../../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, Search, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

/**
 * WorkspaceAcceptance - 職責：A 軌最終交付閾值
 * 決定任務是否真正具備「結案」資格。
 */
export function WorkspaceAcceptance() {
  const { workspace, emitEvent } = useWorkspace();
  const { updateTaskStatus, addIssueToWorkspace } = useAppStore();

  const verifiedTasks = (workspace.tasks || []).filter(t => t.status === 'verified');

  const handleAccept = (id: string, title: string) => {
    updateTaskStatus(workspace.id, id, 'accepted');
    emitEvent("A 軌終結", `最終驗收通過: ${title}`);
    toast({ title: "任務已正式結案", description: `${title} 已完成所有維度驗收。` });
  };

  const handleFail = (id: string, title: string) => {
    updateTaskStatus(workspace.id, id, 'todo');
    addIssueToWorkspace(workspace.id, { 
      title: `驗收失敗: ${title}`, 
      priority: 'high', 
      status: 'open' 
    });
    emitEvent("A 軌崩潰", `驗收失敗回退: ${title}`);
    emitEvent("B 軌激活", `自動建立高優先級議題: 驗收失敗 - ${title}`);
    toast({ 
      variant: "destructive", 
      title: "驗收未通過", 
      description: `${title} 已撤回至待辦狀態，並在 B 軌建立高優先級議題單。` 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> A 軌：最終驗收 (UAT)
          </h3>
        </div>
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">{verifiedTasks.length} 待驗收</Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {verifiedTasks.map(task => (
          <div key={task.id} className="p-5 bg-card/40 border-2 border-amber-500/10 rounded-2xl flex items-center justify-between group hover:border-amber-500/40 transition-all">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">{task.title}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[7px] bg-green-500/5 text-green-600 border-green-500/20 px-1">QA PASSED</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm" 
                className="h-9 border-destructive/20 text-destructive hover:bg-destructive/5 text-[10px] font-bold uppercase"
                onClick={() => handleFail(task.id, task.title)}
              >
                <XCircle className="w-4 h-4 mr-1.5" /> 拒絕結案
              </Button>
              <Button 
                size="sm" 
                className="h-9 bg-amber-500 hover:bg-amber-600 gap-2 text-[10px] font-bold uppercase tracking-widest"
                onClick={() => handleAccept(task.id, task.title)}
              >
                <CheckCircle2 className="w-4 h-4" /> 最終結案
              </Button>
            </div>
          </div>
        ))}
        {verifiedTasks.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-20">
            <Search className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">目前無待驗收項目</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-amber-600 uppercase">驗收安全聲明</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            任何驗收失敗都將被視為重大規格偏離，並自動在 B 軌建立高優先級議題單進行追蹤。
          </p>
        </div>
      </div>
    </div>
  );
}