"use client";

import { useWorkspace } from "../../workspace-context";
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
        emitEvent("B 軌激活", `提交議題: ${newIssue.title}`);
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
          <Badge variant="outline" className="text-[8px] h-4 border-accent/20 bg-accent/5 text-accent">
            PROTOCOL: {protocol || "STANDARD"}
          </Badge>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-2 font-bold uppercase text-[9px] border-accent/20 text-accent" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-3 h-3" /> 提交議題
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {issues?.map(issue => (
          <div key={issue.id} className="p-4 bg-card/40 border-l-4 border-l-accent border border-border/60 rounded-r-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                {getIssueIcon(issue.type)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{issue.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[8px] border-accent/20 text-accent uppercase">{issue.type}</Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">狀態: {issue.status}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">提交治理議題</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>議題標題</Label>
              <Input value={newIssue.title} onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} placeholder="描述異常..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>類型</Label>
                <Select value={newIssue.type} onValueChange={(v) => setNewIssue({ ...newIssue, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">技術規格</SelectItem>
                    <SelectItem value="financial">財務預算</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>優先級</Label>
                <Select value={newIssue.priority} onValueChange={(v) => setNewIssue({ ...newIssue, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">核心 (High)</SelectItem>
                    <SelectItem value="medium">一般 (Medium)</SelectItem>
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