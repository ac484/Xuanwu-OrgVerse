"use client";

import { useWorkspace } from "../../workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Settings2, 
  Trash2, 
  Coins, 
  Clock, 
  View, 
  BarChart3,
  AlertTriangle,
  Info,
  MapPin,
  Box
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * WorkspaceTasks - 職責：WBS 工程級任務治理中心 (超越版)
 * 特色：無限層級、雙向預算約束、動態列治理、自動拓撲編號。
 */
export function WorkspaceTasks() {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<WorkspaceTask> | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // 動態列顯示狀態：治理大規模數據的視覺雜訊
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'type', 'priority', 'subtotal', 'progress', 'status'
  ]));

  const tasksQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(collection(db, "workspaces", workspace.id, "tasks"), orderBy("createdAt", "asc"));
  }, [db, workspace.id]);

  const { data: rawTasks } = useCollection<WorkspaceTask>(tasksQuery);
  const tasks = useMemo(() => rawTasks || [], [rawTasks]);

  // WBS 樹狀結構構建與雙向預算驗證
  const tree = useMemo(() => {
    const map: Record<string, any> = {};
    tasks.forEach(t => map[t.id] = { ...t, children: [], descendantSum: 0, wbsNo: "" });
    const roots: any[] = [];
    
    const build = (node: any, parentNo: string, index: number) => {
      node.wbsNo = parentNo ? `${parentNo}.${index + 1}` : `${index + 1}`;
      let sum = 0;
      tasks.filter(t => t.parentId === node.id).forEach((child, i) => {
        const childNode = map[child.id];
        sum += childNode.subtotal + build(childNode, node.wbsNo, i);
        node.children.push(childNode);
      });
      node.descendantSum = sum;
      return sum;
    };

    tasks.filter(t => !t.parentId).forEach((root, i) => {
      const rootNode = map[root.id];
      build(rootNode, "", i);
      roots.push(rootNode);
    });

    return roots;
  }, [tasks]);

  const handleSaveTask = async () => {
    if (!editingTask?.name) return;

    const subtotal = (Number(editingTask.quantity) || 0) * (Number(editingTask.unitPrice) || 0);
    const taxAmount = subtotal * ((Number(editingTask.taxRate) || 0) / 100);
    const total = subtotal + taxAmount;
    
    // 預算主權驗證：攔截溢出 (向下約束)
    if (editingTask.parentId) {
      const parent = tasks.find(t => t.id === editingTask.parentId);
      if (parent) {
        const currentChildrenSum = tasks
          .filter(t => t.parentId === editingTask.parentId && t.id !== editingTask.id)
          .reduce((acc, t) => acc + (t.subtotal || 0), 0);
        
        if (currentChildrenSum + subtotal > parent.subtotal) {
          toast({ variant: "destructive", title: "預算溢出攔截", description: `子項總合不可超過「${parent.name}」的額度限制。` });
          return;
        }
      }
    }

    // 向上鎖定：父項預算不可低於現有子項總和
    if (editingTask.id) {
      const childSum = tasks.filter(t => t.parentId === editingTask.id).reduce((acc, t) => acc + t.subtotal, 0);
      if (subtotal < childSum) {
        toast({ variant: "destructive", title: "預算主權衝突", description: `預算上限 ($${subtotal}) 不可低於現有子項目的金額總和 ($${childSum})。` });
        return;
      }
    }

    const finalData = { 
      ...editingTask, 
      subtotal, 
      total,
      updatedAt: serverTimestamp(),
      status: editingTask.status || 'todo'
    };

    if (editingTask.id) {
      await updateDoc(doc(db, "workspaces", workspace.id, "tasks", editingTask.id), finalData as any);
      emitEvent("校準工程節點", `${editingTask.name} [Subtotal: ${subtotal}]`);
    } else {
      await addDoc(collection(db, "workspaces", workspace.id, "tasks"), { ...finalData, createdAt: serverTimestamp() } as any);
      emitEvent("定義 WBS 節點", editingTask.name!);
    }
    setIsAddOpen(false);
  };

  const toggleColumn = (key: string) => {
    const next = new Set(visibleColumns);
    if (next.has(key)) next.delete(key); else next.add(key);
    setVisibleColumns(next);
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
          level > 0 && "ml-8 relative before:absolute before:left-[-20px] before:top-[-10px] before:bottom-[50%] before:w-[1.5px] before:bg-primary/20 after:absolute after:left-[-20px] after:top-[50%] after:w-[15px] after:h-[1.5px] after:bg-primary/20"
        )}>
          <button 
            onClick={() => {
              const next = new Set(expandedIds);
              if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
              setExpandedIds(next);
            }} 
            className={cn("p-1 hover:bg-primary/10 rounded-lg transition-colors", !hasChildren && "opacity-0 pointer-events-none")}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5 text-primary" />}
          </button>
          
          <div className="flex-1 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4 flex items-center gap-2">
              <span className="text-[9px] font-mono font-black bg-primary/10 px-1.5 py-0.5 rounded text-primary">{node.wbsNo}</span>
              <p className="text-xs font-black tracking-tight truncate">{node.name}</p>
            </div>
            
            <div className="col-span-6 grid grid-cols-6 gap-2">
              {visibleColumns.has('type') && <div className="text-[9px] font-bold uppercase text-muted-foreground truncate">{node.type}</div>}
              {visibleColumns.has('priority') && (
                <Badge variant="outline" className={cn("text-[7px] h-4 px-1 uppercase w-fit", node.priority === 'high' ? 'border-red-500/50 text-red-500' : '')}>
                  {node.priority}
                </Badge>
              )}
              {visibleColumns.has('subtotal') && (
                <div className="text-right">
                  <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">預算上限</p>
                  <p className={cn("text-[10px] font-bold", isViolating ? 'text-destructive' : 'text-primary')}>${node.subtotal?.toLocaleString()}</p>
                </div>
              )}
              {visibleColumns.has('progress') && (
                <div className="col-span-2 flex items-center gap-2">
                  <Progress value={node.progress || 0} className="h-1 flex-1" />
                  <span className="text-[8px] font-black">{node.progress || 0}%</span>
                </div>
              )}
              {visibleColumns.has('location') && <div className="text-[9px] font-bold text-muted-foreground truncate flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{node.location || '-'}</div>}
              {visibleColumns.has('status') && (
                <div className={cn("w-2 h-2 rounded-full ml-auto self-center", node.status === 'completed' || node.status === 'accepted' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 animate-pulse')} />
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-primary" onClick={() => { setEditingTask({ parentId: node.id, quantity: 1, unitPrice: 0, taxRate: 0, progress: 0, type: '子任務', priority: 'medium' }); setIsAddOpen(true); }}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-primary" onClick={() => { setEditingTask(node); setIsAddOpen(true); }}>
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => { if(confirm('確認要銷毀此工程節點及其後代？')) deleteDoc(doc(db, "workspaces", workspace.id, "tasks", node.id)); }}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="space-y-0.5">
            {node.children.map((child: any) => <RenderTask key={child.id} node={child} level={level + 1} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between bg-card/40 backdrop-blur-md p-4 rounded-3xl border border-primary/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">WBS 工程治理</h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase flex items-center gap-2">
              <Clock className="w-3 h-3" /> 實時預算與拓項監控
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 font-black uppercase text-[10px] rounded-xl">
                <View className="w-3.5 h-3.5" /> 視圖選項
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold">顯示欄位</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={visibleColumns.has('type')} onCheckedChange={() => toggleColumn('type')}>任務類型</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.has('priority')} onCheckedChange={() => toggleColumn('priority')}>優先順序</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.has('subtotal')} onCheckedChange={() => toggleColumn('subtotal')}>預算上限</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.has('progress')} onCheckedChange={() => toggleColumn('progress')}>作業進度</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.has('location')} onCheckedChange={() => toggleColumn('location')}>作業地點</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.has('status')} onCheckedChange={() => toggleColumn('status')}>治理狀態</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" className="h-9 gap-2 font-black uppercase text-[10px] rounded-full shadow-lg shadow-primary/20 px-5" onClick={() => { setEditingTask({ quantity: 1, unitPrice: 0, taxRate: 0, progress: 0, type: '頂層專案', priority: 'medium' }); setIsAddOpen(true); }}>
            <Plus className="w-3.5 h-3.5" /> 建立根節點
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        {tree.length > 0 ? tree.map(root => <RenderTask key={root.id} node={root} />) : (
          <div className="p-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-20 flex flex-col items-center gap-3">
            <Coins className="w-12 h-12" />
            <p className="text-[10px] font-black uppercase tracking-widest">等待工程節點定義...</p>
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl flex items-center gap-3">
                <Settings2 className="w-8 h-8" /> {editingTask?.id ? '校準工程節點' : '定義新節點'}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-8 grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">任務名稱</Label>
              <Input value={editingTask?.name || ""} onChange={e => setEditingTask({...editingTask, name: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">描述與技術規格</Label>
              <Textarea value={editingTask?.description || ""} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className="rounded-xl bg-muted/30 border-none resize-none min-h-[100px]" />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">作業進度 (%)</Label>
              <Input type="number" min="0" max="100" value={editingTask?.progress} onChange={e => setEditingTask({...editingTask, progress: Number(e.target.value)})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">作業地點 (Location)</Label>
              <Input value={editingTask?.location || ""} onChange={e => setEditingTask({...editingTask, location: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">數量 (Qty)</Label>
              <Input type="number" value={editingTask?.quantity} onChange={e => setEditingTask({...editingTask, quantity: Number(e.target.value)})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">單價 (Price)</Label>
              <Input type="number" value={editingTask?.unitPrice} onChange={e => setEditingTask({...editingTask, unitPrice: Number(e.target.value)})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">稅率 (%)</Label>
              <Input type="number" value={editingTask?.taxRate} onChange={e => setEditingTask({...editingTask, taxRate: Number(e.target.value)})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">單位 (Unit)</Label>
              <Input value={editingTask?.unit || ""} onChange={e => setEditingTask({...editingTask, unit: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="col-span-2 p-6 bg-primary/5 rounded-3xl flex justify-between items-center border border-primary/10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">含稅總額 (Total)</p>
                <p className="text-[8px] text-muted-foreground uppercase">預算基數: ${(editingTask?.quantity || 0) * (editingTask?.unitPrice || 0)}</p>
              </div>
              <span className="text-2xl font-mono font-black text-primary">
                ${(((editingTask?.quantity || 0) * (editingTask?.unitPrice || 0)) * (1 + (editingTask?.taxRate || 0)/100)).toLocaleString()}
              </span>
            </div>
          </div>
          
          <DialogFooter className="p-6 bg-muted/30 border-t">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-black uppercase text-[10px]">取消操作</Button>
            <Button onClick={handleSaveTask} className="rounded-xl px-8 shadow-xl shadow-primary/20 font-black uppercase text-[10px]">同步至雲端主權</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}