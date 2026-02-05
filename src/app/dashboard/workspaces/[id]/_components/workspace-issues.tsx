"use client";

import { useWorkspace } from "../workspace-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, ArrowRight, ShieldAlert, GitBranch, DollarSign, PenTool } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function WorkspaceIssues() {
  const { workspace, emitEvent, protocol } = useWorkspace();
  const { db } = useFirebase();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: "", type: "technical" as any, priority: "high" as any });

  // 原子優化：記憶化查詢引用
  const issuesQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(
      collection(db, "workspaces", workspace.id, "issues"),
      orderBy("createdAt", "desc")
    );
  }, [db, workspace.id]);

  const { data: issues } = useCollection<any>(issuesQuery);

  const handleAddIssue = () => {
    if (!newIssue.title.trim()) return;

    const issueData = {
      title: newIssue.title,
      type: newIssue.type,
      priority: newIssue.priority,
      status: 'open',
      createdAt: serverTimestamp()
    };

    const issuesCol = collection(db, "workspaces", workspace.id, "issues");
    addDoc(issuesCol, issueData)
      .then(() => {
        emitEvent("B 軌激活", `提交議題: ${newIssue.title} [${newIssue.type}]`);
        toast({ title: "B 軌議題已提交" });
        setIsAddOpen(false);
        setNewIssue({ title: "", type: "technical", priority: "high" });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: `workspaces/${workspace.id}/issues`,
          operation: 'create',
          requestResourceData: issueData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'technical': return <PenTool className="w-4 h-4 text-primary" />;
      default: return <AlertCircle className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-accent" /> B 軌：異常與衝突治理
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[8px] h-4 border-accent/20 bg-accent/5 text-accent font-mono uppercase">
              PROTOCOL: {protocol || "STANDARD"}
            </Badge>
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-widest border-accent/20 text-accent hover:bg-accent/5" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-3 h-3" /> 提交議題
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {issues?.map(issue => (
          <div key={issue.id} className="p-4 bg-card/40 border-l-4 border-l-accent border border-border/60 rounded-r-2xl hover:bg-accent/5 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                {getIssueIcon(issue.type)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{issue.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[8px] px-1.5 h-4 uppercase font-bold tracking-tighter border-accent/20 text-accent">
                    {issue.type || 'GENERAL'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">狀態: {issue.status}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-accent">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {(!issues || issues.length === 0) && (
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
          當前協議下，所有偏離規格的行為均應在此掛載。包含「技術規格偏離」與「財務預算衝突」。
        </p>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">提交治理議題</DialogTitle>
            <DialogDescription>定義維度內的異常或衝突，並啟動 B 軌追蹤程序。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>議題標題</Label>
              <Input 
                value={newIssue.title} 
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} 
                placeholder="描述發生的異常狀況..." 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>議題類型</Label>
                <Select value={newIssue.type} onValueChange={(v) => setNewIssue({ ...newIssue, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">技術規格 (Technical)</SelectItem>
                    <SelectItem value="financial">財務預算 (Financial)</SelectItem>
                    <SelectItem value="operational">營運流程 (Operational)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>優先級別</Label>
                <Select value={newIssue.priority} onValueChange={(v) => setNewIssue({ ...newIssue, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">核心 (High)</SelectItem>
                    <SelectItem value="medium">一般 (Medium)</SelectItem>
                    <SelectItem value="low">低優先 (Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>取消</Button>
            <Button onClick={handleAddIssue} className="bg-accent hover:bg-accent/90">發佈議題</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
