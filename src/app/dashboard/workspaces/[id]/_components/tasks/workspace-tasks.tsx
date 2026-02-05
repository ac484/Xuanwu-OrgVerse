"use client";

import { useWorkspace } from "../../workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  AlertTriangle,
  Settings2,
  Trash2,
  Coins
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { WorkspaceTask } from "@/types/domain";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function WorkspaceTasks() {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<WorkspaceTask> | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const tasksQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(collection(db, "workspaces", workspace.id, "tasks"), orderBy("createdAt", "asc"));
  }, [db, workspace.id]);

  const { data: rawTasks } = useCollection<WorkspaceTask>(tasksQuery);
  const tasks = useMemo(() => rawTasks || [], [rawTasks]);

  const tree = useMemo(() => {
    const map: Record<string, any> = {};
    tasks.forEach(t => map[t.id] = { ...t, children: [], descendantSum: 0, wbsNo: "" });
    const roots: any[] = [];
    
    const calculateSumAndNo = (node: any, parentNo: string, index: number) => {
      node.wbsNo = parentNo ? `${parentNo}.${index + 1}` : `${index + 1}`;
      let sum = 0;
      tasks.filter(t => t.parentId === node.id).forEach((child, i) => {
        const childNode = map[child.id];
        sum += childNode.subtotal + calculateSumAndNo(childNode, node.wbsNo, i);
        node.children.push(childNode);
      });
      node.descendantSum = sum;
      return sum;
    };

    tasks.filter(t => !t.parentId).forEach((root, i) => {
      const rootNode = map[root.id];
      calculateSumAndNo(rootNode, "", i);
      roots.push(rootNode);
    });

    return roots;
  }, [tasks]);

  const handleSaveTask = () => {
    if (!editingTask?.name) return;

    const subtotal = (Number(editingTask.quantity) || 0) * (Number(editingTask.unitPrice) || 0);
    const finalData = { ...editingTask, subtotal, updatedAt: serverTimestamp() };

    if (editingTask.parentId) {
      const parent = tasks.find(t => t.id === editingTask.parentId);
      if (parent) {
        const currentChildrenSum = tasks
          .filter(t => t.parentId === editingTask.parentId && t.id !== editingTask.id)
          .reduce((acc, t) => acc + t.subtotal, 0);
        
        if (currentChildrenSum + subtotal > parent.subtotal) {
          toast({ variant: "destructive", title: "預算約束衝突", description: "子項總額不可超過父項預算限額。" });
          return;
        }
      }
    }

    if (editingTask.id) {
      const ref = doc(db, "workspaces", workspace.id, "tasks", editingTask.id);
      updateDoc(ref, finalData as any).then(() => {
        emitEvent("校準 WBS 節點", editingTask.name!);
        setIsAddOpen(false);
      });
    } else {
      const col = collection(db, "workspaces", workspace.id, "tasks");
      addDoc(col, { ...finalData, createdAt: serverTimestamp(), status: 'todo', dependencies: [] } as any).then(() => {
        emitEvent("定義 WBS 節點", editingTask.name!);
        setIsAddOpen(false);
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`確定要移除任務「${name}」及其所有子項嗎？`)) {
      deleteDoc(doc(db, "workspaces", workspace.id, "tasks", id)).then(() => {
        emitEvent("註銷 WBS 節點", name);
      });
    }
  };

  const RenderTask = ({ node, level = 0 }: { node: any, level?: number }) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const isViolating = node.descendantSum > node.subtotal;

    return (
      <div className="animate-in slide-in-from-left-2 duration-300">
        <div className={cn(
          "group flex items-center gap-3 p-3 rounded-2xl border transition-all mb-1",
          isViolating ? "bg-destructive/5 border-destructive/30" : "bg-card/40 border-border/60 hover:border-primary/40",
          level > 0 && "ml-8 relative before:absolute before:left-[-20px] before:top-[-10px] before:bottom-[50%] before:w-[2px] before:bg-border/40 before:rounded-full after:absolute after:left-[-20px] after:top-[50%] after:w-[15px] after:h-[2px] after:bg-border/40"
        )}>
          <button 
            onClick={() => {
              const next = new Set(expandedIds);
              if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
              setExpandedIds(next);
            }} 
            className={cn("p-1 hover:bg-muted rounded-lg transition-colors", !hasChildren && "opacity-0 pointer-events-none")}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6 flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{node.wbsNo}</span>
              <div className="truncate">
                <p className="text-sm font-black tracking-tight truncate">{node.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[7px] h-3.5 uppercase tracking-tighter px-1 border-primary/20 text-primary">{node.type}</Badge>
                  {isViolating && (
                    <div className="flex items-center gap-1 text-[8px] font-black text-destructive uppercase animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> 預算溢出
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3 text-right">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">預算額度</p>
              <p className="text-sm font-black text-primary">${node.subtotal?.toLocaleString()}</p>
            </div>

            <div className="md:col-span-3 text-right border-l border-border/20 pl-4">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">子項匯總</p>
              <p className={cn("text-sm font-black", isViolating ? "text-destructive" : "text-foreground/60")}>
                ${node.descendantSum?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary" onClick={() => { setEditingTask({ parentId: node.id, quantity: 1, unitPrice: 0, type: 'Sub-Task' }); setIsAddOpen(true); }}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary" onClick={() => { setEditingTask(node); setIsAddOpen(true); }}>
              <Settings2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(node.id, node.name)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {node.children.map((child: any) => <RenderTask key={child.id} node={child} level={level + 1} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between bg-muted/20 p-4 rounded-[2rem] border border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">WBS 工程結構治理</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">硬性預算約束已啟動 · 無限層級共振</p>
          </div>
        </div>
        <Button size="sm" className="h-10 gap-2 font-black uppercase text-[10px] rounded-full shadow-lg shadow-primary/20 px-6" onClick={() => { setEditingTask({ quantity: 1, unitPrice: 0, type: 'Project', priority: 'medium' }); setIsAddOpen(true); }}>
          <Plus className="w-4 h-4" /> 建立根節點
        </Button>
      </div>

      <div className="space-y-2 px-2">
        {tree.length > 0 ? tree.map(root => <RenderTask key={root.id} node={root} />) : (
          <div className="p-32 text-center border-2 border-dashed rounded-[3rem] bg-muted/5 border-border/40 opacity-30 flex flex-col items-center gap-4">
            <Coins className="w-12 h-12" />
            <p className="text-sm font-black uppercase tracking-[0.3em]">等待工程節點定義</p>
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl flex items-center gap-3">
                <Settings2 className="w-8 h-8" /> {editingTask?.id ? '校準 WBS 節點' : '定義新節點'}
              </DialogTitle>
              <p className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                {editingTask?.parentId ? `掛載至父節點: ${tasks.find(t => t.id === editingTask.parentId)?.name}` : '建立頂層工程塊'}
              </p>
            </DialogHeader>
          </div>
          
          <div className="p-8 grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">任務識別名稱</Label>
              <Input value={editingTask?.name || ""} onChange={e => setEditingTask({...editingTask, name: e.target.value})} placeholder="輸入規格或任務名稱..." className="h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 text-base font-bold" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">規劃數量</Label>
              <Input type="number" value={editingTask?.quantity} onChange={e => setEditingTask({...editingTask, quantity: Number(e.target.value)})} className="h-12 rounded-2xl bg-muted/30 border-none" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">單項預算 (Unit Price)</Label>
              <Input type="number" value={editingTask?.unitPrice} onChange={e => setEditingTask({...editingTask, unitPrice: Number(e.target.value)})} className="h-12 rounded-2xl bg-muted/30 border-none" />
            </div>

            <div className="col-span-2 p-6 bg-primary/5 rounded-[2rem] flex justify-between items-center border border-primary/10 mt-2">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">自動核算總額 (Subtotal)</p>
                <p className="text-[9px] text-muted-foreground font-bold">由系統鎖定計算，作為子項預算上限</p>
              </div>
              <span className="text-3xl font-mono font-black text-primary">
                ${((editingTask?.quantity || 0) * (editingTask?.unitPrice || 0)).toLocaleString()}
              </span>
            </div>
          </div>
          
          <DialogFooter className="p-6 bg-muted/30 border-t flex gap-3">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest">取消</Button>
            <Button onClick={handleSaveTask} className="rounded-xl px-8 shadow-lg shadow-primary/20 font-bold uppercase text-[10px] tracking-widest">同步至維度</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}