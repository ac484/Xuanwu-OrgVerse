"use client";

import { useWorkspace } from "../workspace-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Landmark, TrendingUp, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { useCollection } from "@/firebase";
import { useFirebase } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";

/**
 * WorkspaceFinance - 職責：處理驗收通過後的資金撥付與預算追蹤
 */
export function WorkspaceFinance() {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();

  // 偵聽任務以獲取預算數據
  const tasksQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(collection(db, "workspaces", workspace.id, "tasks"), orderBy("createdAt", "desc"));
  }, [db, workspace.id]);

  const { data: tasks } = useCollection<any>(tasksQuery);

  const stats = useMemo(() => {
    const accepted = (tasks || []).filter(t => t.status === 'accepted');
    const totalSpent = accepted.reduce((acc, t) => acc + (Number(t.budgetImpact) || 0), 0);
    const pending = (tasks || []).filter(t => t.status === 'verified').length;
    
    return { totalSpent, pendingCount: pending, acceptedCount: accepted.length };
  }, [tasks]);

  const handleDisburse = (taskId: string, title: string) => {
    emitEvent("啟動資金撥付", `任務: ${title}`);
    // 這裡未來可以擴展真正的支付 API 串接
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" /> 已核銷總額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">${stats.totalSpent.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">基於 {stats.acceptedCount} 項已驗收任務</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
              <Landmark className="w-3.5 h-3.5" /> 待撥付預備金
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.pendingCount} 筆</div>
            <p className="text-[10px] text-muted-foreground mt-1">QA 通過但尚未最終結案</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-green-600 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> 資金共振率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">100%</div>
            <p className="text-[10px] text-muted-foreground mt-1">與維度預算協議對齊</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> 待清算項目 (驗收完成)
        </h3>
        
        <div className="space-y-2">
          {(tasks || []).filter(t => t.status === 'accepted').map(task => (
            <div key={task.id} className="p-4 bg-card/40 border border-border/60 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[8px] bg-green-500/5 text-green-600 border-green-500/20 px-1">已結案</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">ID: {task.id.slice(0, 6).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">核定金額</p>
                  <p className="text-sm font-bold text-primary">${(Number(task.budgetImpact) || 0).toLocaleString()}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest border-primary/20 hover:bg-primary/5"
                  onClick={() => handleDisburse(task.id, task.title)}
                >
                  啟動撥付 <ArrowUpRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {(tasks || []).filter(t => t.status === 'accepted').length === 0 && (
            <div className="p-12 text-center border-2 border-dashed rounded-3xl opacity-20 italic text-xs">
              目前尚無已驗收的財務項目。
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-muted/30 rounded-2xl border border-border/40 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          財務核算僅處理 A 軌（驗收通過）之結案項目。若有預算超支或資金衝突，請在 B 軌建立「財務類型」議題。
        </p>
      </div>
    </div>
  );
}
