
"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShieldCheck, XCircle, CheckCircle, Search, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

/**
 * WorkspaceQA - 職責：A 軌品質閾值
 * 決定任務是否具備進入「待驗收」階段的資格。
 */
export function WorkspaceQA() {
  const { workspace, emitEvent } = useWorkspace();
  const { updateTaskStatus, addIssueToWorkspace } = useAppStore();

  const qaTasks = (workspace.tasks || []).filter(t => t.status === 'completed');

  const handleApprove = (id: string, title: string) => {
    updateTaskStatus(workspace.id, id, 'verified');
    emitEvent("A 軌推進", `品檢通過: ${title}`);
    toast({ title: "品檢完成", description: `${title} 已通過品質閾值，送交驗收。` });
  };

  const handleReject = (id: string, title: string) => {
    // 駁回時，同時觸發 A 軌回退與 B 軌記錄
    updateTaskStatus(workspace.id, id, 'todo');
    addIssueToWorkspace(workspace.id, { 
      title: `QA 駁回: ${title}`, 
      priority: 'medium', 
      status: 'open' 
    });
    emitEvent("A 軌回退", `品檢駁回: ${title}`);
    emitEvent("B 軌激活", `自動建立異常單: QA 駁回 - ${title}`);
    toast({ 
      variant: "destructive", 
      title: "任務已駁回", 
      description: `${title} 未達品質標準，已自動在 B 軌建立異常單。` 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> A 軌：品質檢驗 (QA)
        </h3>
        <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-none">{qaTasks.length} 待檢核</Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {qaTasks.map(task => (
          <div key={task.id} className="p-4 bg-card/40 border border-border/60 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all">
            <div className="space-y-1">
              <h4 className="text-sm font-bold">{task.title}</h4>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">提交者: 維度成員</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10 gap-1 text-[10px] font-bold uppercase"
                onClick={() => handleReject(task.id, task.title)}
              >
                <XCircle className="w-3.5 h-3.5" /> 駁回並開單
              </Button>
              <Button 
                size="sm" 
                className="h-8 bg-green-600 hover:bg-green-700 gap-1 text-[10px] font-bold uppercase"
                onClick={() => handleApprove(task.id, task.title)}
              >
                <CheckCircle className="w-3.5 h-3.5" /> 通過
              </Button>
            </div>
          </div>
        ))}
        {qaTasks.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-20">
            <Search className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">目前無待檢驗項目</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-primary opacity-60" />
        <p className="text-[11px] text-muted-foreground">
          駁回操作會自動觸發 B 軌異常處理機制，以確保所有品質偏離都具備可追蹤性。
        </p>
      </div>
    </div>
  );
}
