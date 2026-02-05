
"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function WorkspaceAcceptance() {
  const { workspace, emitEvent } = useWorkspace();
  const { updateTaskStatus } = useAppStore();

  const verifiedTasks = (workspace.tasks || []).filter(t => t.status === 'verified');

  const handleAccept = (id: string, title: string) => {
    updateTaskStatus(workspace.id, id, 'accepted');
    emitEvent("最終驗收", title);
    toast({ title: "任務已驗收", description: `${title} 已正式結案。` });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> 最終驗收 (UAT)
        </h3>
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
            <Button 
              size="sm" 
              className="h-9 bg-amber-500 hover:bg-amber-600 gap-2 text-[10px] font-bold uppercase tracking-widest"
              onClick={() => handleAccept(task.id, task.title)}
            >
              <CheckCircle2 className="w-4 h-4" /> 結案驗收
            </Button>
          </div>
        ))}
        {verifiedTasks.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-20">
            <Search className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">目前無待驗收項目</p>
          </div>
        )}
      </div>
    </div>
  );
}
