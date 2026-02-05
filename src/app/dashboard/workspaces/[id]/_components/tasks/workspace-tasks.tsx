
"use client";

import { useWorkspace } from "../../workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Settings2, 
  Trash2, 
  Coins, 
  FileDown, 
  FileUp, 
  Clock, 
  MapPin, 
  Tag, 
  View, 
  Link2,
  Calendar,
  Box
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, writeBatch } from "firebase/firestore";
import { WorkspaceTask } from "@/types/domain";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
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
import { cn } from "@/lib/utils";

/**
 * WorkspaceTasks - 職責：WBS 工程級任務治理中心 (Surpass Version)
 * 核心：無限層級、雙向預算約束、動態列治理、JSON 遷移、拓撲檢核。
 */
export function WorkspaceTasks() {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<WorkspaceTask> | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 動態列顯示狀態
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'type', 'priority', 'subtotal', 'status', 'location'
  ]));

  const tasksQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(collection(db, "workspaces", workspace.id, "tasks"), orderBy("createdAt", "asc"));
  }, [db, workspace.id]);

  const { data: rawTasks } = useCollection<WorkspaceTask>(tasksQuery);
  const tasks = useMemo(() => rawTasks || [], [rawTasks]);

  // WBS 樹狀結構構建與雙向預算即時驗證
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
    
    // 1. 預算主權驗證 (向下約束)
    if (editingTask.parentId) {
      const parent = tasks.find(t => t.id === editingTask.parentId);
      if (parent) {
        const currentChildrenSum = tasks
          .filter(t => t.parentId === editingTask.parentId && t.id !== editingTask.id)
          .reduce((acc, t) => acc + (t.subtotal || 0), 0);
        
        if (currentChildrenSum + subtotal > parent.subtotal) {
          toast({ variant: "destructive", title: "預算溢出攔截", description: `子項總額超過父項「${parent.name}」的上限。` });
          return;
        }
      }
    }

    // 2. 預算主權驗證 (向上鎖定：不能改得比現有子項總和還低)
    if (editingTask.id) {
      const currentInTree = tasks.find(t => t.id === editingTask.id);
      const childSum = tasks.filter(t => t.parentId === editingTask.id).reduce((acc, t) => acc + t.subtotal, 0);
      if (subtotal < childSum) {
        toast({ variant: "destructive", title: "預算主權衝突", description: "父項預算不可低於現有子項之總和。" });
        return;
      }
    }

    // 3. 相依性檢核 (禁止自我相依)
    if (editingTask.dependencies?.includes(editingTask.id!)) {
      toast({ variant: "destructive", title: "拓撲錯誤", description: "任務不可相依於自身。" });
      return;
    }

    const finalData = { 
      ...editingTask, 
      subtotal, 
      updatedAt: serverTimestamp(),
      status: editingTask.status || 'todo'
    };

    if (editingTask.id) {
      const ref = doc(db, "workspaces", workspace.id, "tasks", editingTask.id);
      await updateDoc(ref, finalData as any);
      emitEvent("校準 WBS 節點", `${editingTask.name}`);
    } else {
      const col = collection(db, "workspaces", workspace.id, "tasks");
      await addDoc(col, { ...finalData, createdAt: serverTimestamp() } as any);
      emitEvent("定義 WBS 節點", editingTask.name!);
    }
    setIsAddOpen(false);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WBS_${workspace.name}_${new Date().getTime()}.json`;
    link.click();
    toast({ title: "WBS 結構已匯出" });
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        const batch = writeBatch(db);
        const colRef = collection(db, "workspaces", workspace.id, "tasks");
        imported.forEach((item: any) => {
          const { id, ...rest } = item;
          batch.set(doc(colRef), { ...rest, createdAt: serverTimestamp() });
        });
        await batch.commit();
        toast({ title: "WBS 結構已同步" });
      } catch (err) {
        toast({ variant: "destructive", title: "匯入失敗" });
      }
    };
    reader.readAsText(file);
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
          isViolating ? "bg-destructive/5 border-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "bg-card/40 border-border/60 hover:border-primary/40",
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
          
          <div className="flex-1 grid grid-cols-12 gap-2 items-center">
            <div className="col-span-4 flex items-center gap-2">
              <span className="text-[9px] font-mono font-black bg-primary/10 px-1.5 py-0.5 rounded text-primary">{node.wbsNo}</span>
              <p className="text-xs font-black tracking-tight truncate">{node.name}</p>
            </div>
            
            {visibleColumns.has('type') && <div className="col-span-1 text-[9px] font-bold uppercase text-muted-foreground truncate">{node.type}</div>}
            {visibleColumns.has('priority') && (
              <div className="col-span-1">
                <Badge variant="outline" className={cn("text-[7px] h-4 px-1 uppercase", node.priority === 'high' ? 'border-red-500/50 text-red-500' : '')}>
                  {node.priority}
                </Badge>
              </div>
            )}
            {visibleColumns.has('location') && <div className="col-span-1 text-[9px] text-muted-foreground truncate flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {node.location || '-'}</div>}
            
            <div className="col-span-2 text-right">
              <p className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-0.5">預算上限</p>
              <p className="text-[11px] font-black text-primary">${node.subtotal?.toLocaleString()}</p>
            </div>

            <div className="col-span-2 text-right border-l border-border/20 pl-2">
              <p className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-0.5">子項累計</p>
              <p className={cn("text-[11px] font-black", isViolating ? "text-destructive animate-pulse" : "text-foreground/40")}>
                ${node.descendantSum?.toLocaleString()}
              </p>
            </div>

            {visibleColumns.has('status') && (
              <div className="col-span-1 text-right">
                <div className={cn("w-2 h-2 rounded-full ml-auto", node.status === 'completed' ? 'bg-green-500' : 'bg-amber-500')} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-primary" onClick={() => { setEditingTask({ parentId: node.id, quantity: 1, unitPrice: 0, type: '子任務', priority: 'medium' }); setIsAddOpen(true); }}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-primary" onClick={() => { setEditingTask(node); setIsAddOpen(true); }}>
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => { if(confirm('銷毀節點？')) deleteDoc(doc(db, "workspaces", workspace.id, "tasks", node.id)); }}>
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
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">WBS 工程治理體系</h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase flex items-center gap-2">
              <Clock className="w-3 h-3" /> 實時預算與拓撲檢核中
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 font-black uppercase text-[10px] rounded-xl border-primary/20">
                <View className="w-3.5 h-3.5" /> 視圖選項
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">顯示欄位</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={visibleColumns.has('type')} onCheckedChange={() => toggleColumn('type')}>任務類型</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.has('priority')} onCheckedChange={() => toggleColumn('priority')}>優先順序</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.has('location')} onCheckedChange={() => toggleColumn('location')}>作業地點</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.has('status')} onCheckedChange={() => toggleColumn('status')}>治理狀態</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="h-9 rounded-xl gap-2 font-black uppercase text-[10px]" onClick={handleExportJSON}>
            <FileDown className="w-3.5 h-3.5" /> 匯出
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-xl gap-2 font-black uppercase text-[10px]" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="w-3.5 h-3.5" /> 匯入
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportJSON} />
          <Button size="sm" className="h-9 gap-2 font-black uppercase text-[10px] rounded-full shadow-lg shadow-primary/20 px-5" onClick={() => { setEditingTask({ quantity: 1, unitPrice: 0, type: '頂層專案', priority: 'medium' }); setIsAddOpen(true); }}>
            <Plus className="w-3.5 h-3.5" /> 建立根節點
          </Button>
        </div>
      </div>

      <div className="space-y-1 px-1">
        {tree.length > 0 ? tree.map(root => <RenderTask key={root.id} node={root} />) : (
          <div className="p-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-20 flex flex-col items-center gap-3">
            <Coins className="w-12 h-12" />
            <p className="text-[10px] font-black uppercase tracking-widest">等待工程節點定義</p>
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl flex items-center gap-3">
                <Settings2 className="w-8 h-8" /> {editingTask?.id ? '校準工程節點' : '定義新節點'}
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-widest mt-2">
                治理主權：{editingTask?.parentId ? '階層延伸' : '頂層資源'}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 grid grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">任務識別名稱</Label>
              <Input value={editingTask?.name || ""} onChange={e => setEditingTask({...editingTask, name: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">描述與技術規格</Label>
              <Textarea value={editingTask?.description || ""} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className="rounded-xl bg-muted/30 border-none resize-none min-h-[80px]" />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">任務類型</Label>
              <Input value={editingTask?.type || ""} onChange={e => setEditingTask({...editingTask, type: e.target.value})} placeholder="例如: 採購, 研發..." className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">優先級別</Label>
              <Select value={editingTask?.priority} onValueChange={v => setEditingTask({...editingTask, priority: v as any})}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">規劃數量 (Qty)</Label>
              <Input type="number" value={editingTask?.quantity} onChange={e => setEditingTask({...editingTask, quantity: Number(e.target.value)})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">單項預算 (Unit Price)</Label>
              <Input type="number" value={editingTask?.unitPrice} onChange={e => setEditingTask({...editingTask, unitPrice: Number(e.target.value)})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> 作業地點</Label>
              <Input value={editingTask?.location || ""} onChange={e => setEditingTask({...editingTask, location: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><Box className="w-3 h-3" /> 作業空間</Label>
              <Input value={editingTask?.space || ""} onChange={e => setEditingTask({...editingTask, space: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> 開始時間</Label>
              <Input type="date" value={editingTask?.startTime || ""} onChange={e => setEditingTask({...editingTask, startTime: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> 結束時間</Label>
              <Input type="date" value={editingTask?.endTime || ""} onChange={e => setEditingTask({...editingTask, endTime: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-none" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1"><Link2 className="w-3 h-3" /> 相依任務 (Dependency IDs)</Label>
              <Input 
                value={editingTask?.dependencies?.join(", ") || ""} 
                onChange={e => setEditingTask({...editingTask, dependencies: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} 
                placeholder="ID1, ID2..."
                className="h-11 rounded-xl bg-muted/30 border-none" 
              />
            </div>

            <div className="col-span-2 p-6 bg-primary/5 rounded-3xl flex justify-between items-center border border-primary/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">自動核算總額 (Subtotal)</p>
              <span className="text-2xl font-mono font-black text-primary">
                ${((editingTask?.quantity || 0) * (editingTask?.unitPrice || 0)).toLocaleString()}
              </span>
            </div>
          </div>
          
          <DialogFooter className="p-6 bg-muted/30 border-t flex gap-3">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6">取消</Button>
            <Button onClick={handleSaveTask} className="rounded-xl px-10 shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest">同步主權</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
