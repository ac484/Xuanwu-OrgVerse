
"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShieldCheck, XCircle, CheckCircle, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function WorkspaceQA() {
  const { workspace, emitEvent } = useWorkspace();
  const { updateTaskStatus } = useAppStore();

  const qaTasks = (workspace.tasks || []).filter(t => t.status === 'completed');

  const handleApprove = (id: string, title: string) => {
    updateTaskStatus(workspace.id, id, 'verified');
    emitEvent("品檢通過", title);
    toast({ title: "品檢完成", description: `${title} 已送交驗收。` });
  };

  const handleReject = (id: string, title: string) => {
    updateTaskStatus(workspace.id, id, 'todo');
    emitEvent("品檢駁回", title);
    toast({ variant: "destructive", title: "任務已駁回", description: `${title} 需要重新執行。` });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> 品質檢驗 (QA)
        </h3>
        <Badge variant="secondary" className="text-[10px] font-bold">{qaTasks.length} 待檢核</Badge>
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
                <XCircle className="w-3.5 h-3.5" /> 駁回
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
    </div>
  );
}
