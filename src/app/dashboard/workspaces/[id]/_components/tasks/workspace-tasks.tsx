"use client";

import { useWorkspace } from "../../workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ListTodo, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Trash2,
  Layers,
  Download,
  Upload
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
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * WBS 任務治理系統 - 核心邏輯
 */
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
    tasks.forEach(t => map[t.id] = { ...t, children: [], totalDescendantSubtotal: 0 });
    const roots: any[] = [];
    
    const calculateDescendants = (id: string): number => {
      const node = map[id];
      let sum = 0;
      tasks.filter(t => t.parentId === id).forEach(child => {
        sum += (map[child.id].subtotal || 0) + calculateDescendants(child.id);
      });
      node.totalDescendantSubtotal = sum;
      return sum;
    };

    tasks.forEach(t => {
      if (t.parentId && map[t.parentId]) {
        map[t.parentId].children.push(map[t.id]);
      } else {
        roots.push(map[t.id]);
      }
    });

    roots.forEach(root => calculateDescendants(root.id));
    return roots;
  }, [tasks]);

  const getBudgetViolation = (task: Partial<WorkspaceTask>) => {
    const subtotal = (Number(task.quantity) || 0) * (Number(task.unitPrice) || 0);
    const findInTree = (nodes: any[]): any => {
      for (const n of nodes) {
        if (n.id === task.id) return n;
        const found = findInTree(n.children);
        if (found) return found;
      }
      return null;
    };
    const node = findInTree(tree);
    if (node && node.totalDescendantSubtotal > subtotal) {
      return { limit: subtotal, actual: node.totalDescendantSubtotal };
    }
    return null;
  };

  const handleSaveTask = () => {
    if (!editingTask?.name) return;

    const subtotal = (Number(editingTask.quantity) || 0) * (Number(editingTask.unitPrice) || 0);
    const finalData = { ...editingTask, subtotal, updatedAt: serverTimestamp() };

    const violation = getBudgetViolation(editingTask);
    if (violation) {
      toast({ 
        variant: "destructive", 
        title: "預算約束違規", 
        description: `子項總額 $${violation.actual} 超過父項限額 $${violation.limit}。` 
      });
      return;
    }

    if (editingTask.id) {
      const ref = doc(db, "workspaces", workspace.id, "tasks", editingTask.id);
      updateDoc(ref, finalData as any).then(() => {
        emitEvent("更新 WBS 任務", editingTask.name!);
        setIsAddOpen(false);
      });
    } else {
      const col = collection(db, "workspaces", workspace.id, "tasks");
      addDoc(col, { ...finalData, createdAt: serverTimestamp(), status: 'todo', dependencies: [] } as any).then(() => {
        emitEvent("建立 WBS 任務", editingTask.name!);
        setIsAddOpen(false);
      });
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedIds(next);
  };

  const RenderTask = ({ node, level = 0 }: { node: any, level?: number }) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const budgetViolation = node.totalDescendantSubtotal > node.subtotal;

    return (
      <div className="space-y-1">
        <div className={cn("group flex items-center gap-3 p-3 rounded-xl border transition-all", budgetViolation ? "bg-destructive/5 border-destructive/40" : "bg-card/40 border-border/60", level > 0 && "ml-6 border-l-2")}>
          <button onClick={() => toggleExpand(node.id)} className={cn("p-1 hover:bg-muted rounded", !hasChildren && "opacity-0")}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="col-span-2">
              <p className="text-sm font-bold truncate">{node.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[8px] h-4 uppercase">{node.type}</Badge>
                {budgetViolation && <Badge variant="destructive" className="text-[8px] h-4">預算溢出</Badge>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">${node.subtotal?.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingTask(node); setIsAddOpen(true); }}>
              <Plus className="w-4 h-4" />
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4" /> WBS 工程分解結構
          </h3>
        </div>
        <Button size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase shadow-lg shadow-primary/20" onClick={() => { setEditingTask({ quantity: 1, unitPrice: 0, type: 'Task', priority: 'medium' }); setIsAddOpen(true); }}>
          <Plus className="w-3.5 h-3.5" /> 建立根節點
        </Button>
      </div>

      <div className="space-y-2">
        {tree.map(root => <RenderTask key={root.id} node={root} />)}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask?.id ? '校準 WBS 節點' : '定義新節點'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="col-span-2 space-y-2">
              <Label>任務名稱</Label>
              <Input value={editingTask?.name || ""} onChange={e => setEditingTask({...editingTask, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>數量</Label>
              <Input type="number" value={editingTask?.quantity} onChange={e => setEditingTask({...editingTask, quantity: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>單價</Label>
              <Input type="number" value={editingTask?.unitPrice} onChange={e => setEditingTask({...editingTask, unitPrice: Number(e.target.value)})} />
            </div>
            <div className="col-span-2 p-4 bg-muted/30 rounded-xl flex justify-between items-center">
              <span className="text-xs font-bold uppercase">總額 (Subtotal)</span>
              <span className="text-xl font-mono font-bold text-primary">
                ${((editingTask?.quantity || 0) * (editingTask?.unitPrice || 0)).toLocaleString()}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>取消</Button>
            <Button onClick={handleSaveTask}>同步變動</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}