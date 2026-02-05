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
  Settings2
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
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

/**
 * WorkspaceTasks - 職責：實施 WBS 工程結構治理
 * 整合了預算約束邏輯與無限層級渲染。
 */
export function WorkspaceTasks() {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<WorkspaceTask> | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // 1. 數據獲取：實時同步空間內的所有原子任務
  const tasksQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(collection(db, "workspaces", workspace.id, "tasks"), orderBy("createdAt", "asc"));
  }, [db, workspace.id]);

  const { data: rawTasks } = useCollection<WorkspaceTask>(tasksQuery);
  const tasks = useMemo(() => rawTasks || [], [rawTasks]);

  // 2. WBS 樹狀構建與預算累加邏輯
  const tree = useMemo(() => {
    const map: Record<string, any> = {};
    tasks.forEach(t => map[t.id] = { ...t, children: [], descendantSum: 0 });
    const roots: any[] = [];
    
    // 遞迴計算所有後代的 Subtotal 總和
    const calculateSum = (id: string): number => {
      const node = map[id];
      let sum = 0;
      tasks.filter(t => t.parentId === id).forEach(child => {
        sum += (map[child.id].subtotal || 0) + calculateSum(child.id);
      });
      node.descendantSum = sum;
      return sum;
    };

    tasks.forEach(t => {
      if (t.parentId && map[t.parentId]) {
        map[t.parentId].children.push(map[t.id]);
      } else {
        roots.push(map[t.id]);
      }
    });

    roots.forEach(root => calculateSum(root.id));
    return roots;
  }, [tasks]);

  // 3. 核心保存與驗證邏輯
  const handleSaveTask = () => {
    if (!editingTask?.name) return;

    const subtotal = (Number(editingTask.quantity) || 0) * (Number(editingTask.unitPrice) || 0);
    const finalData = { ...editingTask, subtotal, updatedAt: serverTimestamp() };

    // 檢查預算違規 (子項總和不得超過父項 Subtotal)
    if (editingTask.parentId) {
      const parent = tasks.find(t => t.id === editingTask.parentId);
      if (parent) {
        const otherChildrenSum = tasks
          .filter(t => t.parentId === editingTask.parentId && t.id !== editingTask.id)
          .reduce((acc, t) => acc + t.subtotal, 0);
        
        if (otherChildrenSum + subtotal > parent.subtotal) {
          toast({ 
            variant: "destructive", 
            title: "預算約束違規", 
            description: `子任務總額將超過父任務限額 ($${parent.subtotal})。` 
          });
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
        emitEvent("定義新 WBS 節點", editingTask.name!);
        setIsAddOpen(false);
      });
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedIds(next);
  };

  // 4. 遞迴渲染組件
  const RenderTask = ({ node, level = 0 }: { node: any, level?: number }) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const isViolating = node.descendantSum > node.subtotal;

    return (
      <div className="space-y-1">
        <div className={cn(
          "group flex items-center gap-3 p-3 rounded-xl border transition-all",
          isViolating ? "bg-destructive/5 border-destructive/30" : "bg-card/40 border-border/60 hover:border-primary/30",
          level > 0 && "ml-6 border-l-2"
        )}>
          <button onClick={() => toggleExpand(node.id)} className={cn("p-1 hover:bg-muted rounded", !hasChildren && "opacity-0")}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="col-span-2">
              <p className="text-sm font-bold truncate">{node.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[8px] h-4 uppercase">{node.type}</Badge>
                {isViolating && <Badge variant="destructive" className="text-[8px] h-4 animate-pulse">預算超支</Badge>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold text-[9px]">額度</p>
              <p className="text-sm font-bold text-primary">${node.subtotal?.toLocaleString()}</p>
            </div>
            <div className="text-right border-l pl-4 border-border/40">
              <p className="text-xs text-muted-foreground uppercase font-bold text-[9px]">已分派</p>
              <p className={cn("text-sm font-bold", isViolating ? "text-destructive" : "text-foreground")}>
                ${node.descendantSum?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingTask({ parentId: node.id, quantity: 1, unitPrice: 0, type: 'Sub-Task' }); setIsAddOpen(true); }}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingTask(node); setIsAddOpen(true); }}>
              <Settings2 className="w-4 h-4" />
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
        <Button size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase shadow-lg shadow-primary/20" onClick={() => { setEditingTask({ quantity: 1, unitPrice: 0, type: 'Project', priority: 'medium' }); setIsAddOpen(true); }}>
          <Plus className="w-3.5 h-3.5" /> 建立根節點
        </Button>
      </div>

      <div className="space-y-2">
        {tree.length > 0 ? tree.map(root => <RenderTask key={root.id} node={root} />) : (
          <div className="p-20 text-center border-2 border-dashed rounded-3xl opacity-20">
            <Layers className="w-12 h-12 mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">尚無工作分解結構</p>
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{editingTask?.id ? '校準 WBS 節點' : '定義新節點'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="col-span-2 space-y-2">
              <Label>任務名稱</Label>
              <Input value={editingTask?.name || ""} onChange={e => setEditingTask({...editingTask, name: e.target.value})} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>數量</Label>
              <Input type="number" value={editingTask?.quantity} onChange={e => setEditingTask({...editingTask, quantity: Number(e.target.value)})} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>單價</Label>
              <Input type="number" value={editingTask?.unitPrice} onChange={e => setEditingTask({...editingTask, unitPrice: Number(e.target.value)})} className="h-11 rounded-xl" />
            </div>
            <div className="col-span-2 p-4 bg-primary/5 rounded-2xl flex justify-between items-center border border-primary/10">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">自動計算總額 (Subtotal)</span>
              <span className="text-2xl font-mono font-bold text-primary">
                ${((editingTask?.quantity || 0) * (editingTask?.unitPrice || 0)).toLocaleString()}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>取消</Button>
            <Button onClick={handleSaveTask} className="rounded-xl shadow-lg shadow-primary/20">同步變動</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
