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
  AlertTriangle,
  Settings2,
  Trash2,
  Coins,
  FileDown,
  FileUp,
  Clock,
  MapPin,
  Tag
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
import { cn } from "@/lib/utils";

/**
 * WorkspaceTasks - 職責：WBS 工程級任務治理中心
 * 核心：無限層級、硬性預算約束、全維度欄位管理、JSON 結構化遷移。
 */
export function WorkspaceTasks() {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<WorkspaceTask> | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tasksQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(collection(db, "workspaces", workspace.id, "tasks"), orderBy("createdAt", "asc"));
  }, [db, workspace.id]);

  const { data: rawTasks } = useCollection<WorkspaceTask>(tasksQuery);
  const tasks = useMemo(() => rawTasks || [], [rawTasks]);

  // WBS 樹狀結構構建與預算即時驗證
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
    
    // 硬性預算驗證：子項總額不可超過父項限額
    if (editingTask.parentId) {
      const parent = tasks.find(t => t.id === editingTask.parentId);
      if (parent) {
        const currentChildrenSum = tasks
          .filter(t => t.parentId === editingTask.parentId && t.id !== editingTask.id)
          .reduce((acc, t) => acc + (t.subtotal || 0), 0);
        
        if (currentChildrenSum + subtotal > parent.subtotal) {
          toast({ 
            variant: "destructive", 
            title: "預算主權衝突", 
            description: `子項總額 (${(currentChildrenSum + subtotal).toLocaleString()}) 超出了父項「${parent.name}」的限額 (${parent.subtotal.toLocaleString()})。請先調整父項預算或縮減子項規模。` 
          });
          return;
        }
      }
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
      emitEvent("校準 WBS 節點", `${editingTask.name} [V]`);
    } else {
      const col = collection(db, "workspaces", workspace.id, "tasks");
      await addDoc(col, { ...finalData, createdAt: serverTimestamp(), dependencies: [] } as any);
      emitEvent("定義 WBS 節點", editingTask.name!);
    }
    setIsAddOpen(false);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `WBS_${workspace.name}_${new Date().getTime()}.json`);
    linkElement.click();
    toast({ title: "WBS 結構已匯出", description: "已生成全維度遷移文檔。" });
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (!Array.isArray(imported)) throw new Error("無效的 WBS 結構");

        const batch = writeBatch(db);
        const colRef = collection(db, "workspaces", workspace.id, "tasks");
        
        imported.forEach(item => {
          const { id, ...rest } = item;
          const newDoc = doc(colRef);
          batch.set(newDoc, { ...rest, createdAt: serverTimestamp() });
        });

        await batch.commit();
        toast({ title: "WBS 結構已同步", description: "全維度結構已成功遷移至此空間。" });
      } catch (err) {
        toast({ variant: "destructive", title: "匯入失敗", description: "文檔格式不符合 WBS 治理規範。" });
      }
    };
    reader.readAsText(file);
  };

  const RenderTask = ({ node, level = 0 }: { node: any, level?: number }) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const isViolating = node.descendantSum > node.subtotal;

    return (
      <div className="animate-in slide-in-from-left-2 duration-300">
        <div className={cn(
          "group flex items-center gap-3 p-4 rounded-3xl border transition-all mb-2",
          isViolating ? "bg-destructive/5 border-destructive/30 ring-1 ring-destructive/20" : "bg-card/40 border-border/60 hover:border-primary/40",
          level > 0 && "ml-10 relative before:absolute before:left-[-24px] before:top-[-12px] before:bottom-[50%] before:w-[2px] before:bg-primary/20 before:rounded-full after:absolute after:left-[-24px] after:top-[50%] after:w-[18px] after:h-[2px] after:bg-primary/20"
        )}>
          <button 
            onClick={() => {
              const next = new Set(expandedIds);
              if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
              setExpandedIds(next);
            }} 
            className={cn("p-1.5 hover:bg-primary/10 rounded-xl transition-colors", !hasChildren && "opacity-0 pointer-events-none")}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-primary" />}
          </button>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 flex items-center gap-3">
              <span className="text-[10px] font-mono font-black bg-primary/10 px-2 py-0.5 rounded-lg text-primary">{node.wbsNo}</span>
              <div className="truncate">
                <p className="text-sm font-black tracking-tight truncate flex items-center gap-2">
                  {node.name}
                  {node.status === 'completed' && <Badge className="bg-green-500/10 text-green-600 border-none h-4 text-[8px]">DONE</Badge>}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {node.type}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {node.location || '維度內'}</span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3 text-right">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">預算額度</p>
              <p className="text-sm font-black text-primary">${node.subtotal?.toLocaleString()}</p>
            </div>

            <div className="md:col-span-3 text-right border-l border-border/20 pl-4">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">子項累計</p>
              <p className={cn("text-sm font-black", isViolating ? "text-destructive animate-pulse" : "text-foreground/60")}>
                ${node.descendantSum?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all ml-4">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl hover:bg-primary/10 text-primary" onClick={() => { setEditingTask({ parentId: node.id, quantity: 1, unitPrice: 0, type: '子任務', priority: 'medium' }); setIsAddOpen(true); }}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl hover:bg-primary/10 text-primary" onClick={() => { setEditingTask(node); setIsAddOpen(true); }}>
              <Settings2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl hover:bg-destructive/10 text-destructive" onClick={() => { if(confirm('銷毀節點？')) deleteDoc(doc(db, "workspaces", workspace.id, "tasks", node.id)); }}>
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
      <div className="flex items-center justify-between bg-card/40 backdrop-blur-md p-5 rounded-[2.5rem] border border-primary/20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-[0.2em] text-foreground">WBS 工程治理體系</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3" /> 實時預算約束已啟動 · 無限層級共振
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 rounded-2xl gap-2 font-black uppercase text-[10px]" onClick={handleExportJSON}>
            <FileDown className="w-4 h-4" /> 匯出
          </Button>
          <Button variant="outline" size="sm" className="h-10 rounded-2xl gap-2 font-black uppercase text-[10px]" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="w-4 h-4" /> 匯入
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportJSON} />
          <Button size="sm" className="h-10 gap-2 font-black uppercase text-[10px] rounded-full shadow-xl shadow-primary/20 px-6" onClick={() => { setEditingTask({ quantity: 1, unitPrice: 0, type: '頂層專案', priority: 'medium' }); setIsAddOpen(true); }}>
            <Plus className="w-4 h-4" /> 建立根節點
          </Button>
        </div>
      </div>

      <div className="space-y-2 px-2">
        {tree.length > 0 ? tree.map(root => <RenderTask key={root.id} node={root} />) : (
          <div className="p-32 text-center border-2 border-dashed rounded-[3rem] bg-muted/5 border-border/40 opacity-30 flex flex-col items-center gap-4">
            <Coins className="w-16 h-16" />
            <p className="text-sm font-black uppercase tracking-[0.3em]">等待工程節點定義</p>
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-10 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-4xl flex items-center gap-4">
                <Settings2 className="w-10 h-10" /> {editingTask?.id ? '校準工程節點' : '定義新節點'}
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/70 text-xs font-bold uppercase tracking-[0.2em] mt-3">
                {editingTask?.parentId ? `掛載至父節點: ${tasks.find(t => t.id === editingTask.parentId)?.name}` : '建立頂層資源邊界'}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-10 grid grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">任務識別名稱</Label>
              <Input value={editingTask?.name || ""} onChange={e => setEditingTask({...editingTask, name: e.target.value})} placeholder="輸入規格或任務名稱..." className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 text-lg font-bold" />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">描述與技術規格</Label>
              <Textarea value={editingTask?.description || ""} onChange={e => setEditingTask({...editingTask, description: e.target.value})} placeholder="詳細描述作業範疇..." className="rounded-2xl bg-muted/30 border-none resize-none" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">任務類型</Label>
              <Input value={editingTask?.type || ""} onChange={e => setEditingTask({...editingTask, type: e.target.value})} placeholder="例如: 採購, 研發..." className="h-12 rounded-2xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">優先級別</Label>
              <Select value={editingTask?.priority} onValueChange={v => setEditingTask({...editingTask, priority: v as any})}>
                <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低 (Low)</SelectItem>
                  <SelectItem value="medium">中 (Medium)</SelectItem>
                  <SelectItem value="high">高 (High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">規劃數量</Label>
              <Input type="number" value={editingTask?.quantity} onChange={e => setEditingTask({...editingTask, quantity: Number(e.target.value)})} className="h-12 rounded-2xl bg-muted/30 border-none" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">單項預算 (Unit Price)</Label>
              <Input type="number" value={editingTask?.unitPrice} onChange={e => setEditingTask({...editingTask, unitPrice: Number(e.target.value)})} className="h-12 rounded-2xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">作業地點</Label>
              <Input value={editingTask?.location || ""} onChange={e => setEditingTask({...editingTask, location: e.target.value})} placeholder="例如: 雲端 A 區" className="h-12 rounded-2xl bg-muted/30 border-none" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">治理狀態</Label>
              <Select value={editingTask?.status} onValueChange={v => setEditingTask({...editingTask, status: v as any})}>
                <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">待辦 (To Do)</SelectItem>
                  <SelectItem value="completed">完成 (Done)</SelectItem>
                  <SelectItem value="verified">已驗證 (Verified)</SelectItem>
                  <SelectItem value="accepted">已驗收 (Accepted)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 p-8 bg-primary/5 rounded-[2.5rem] flex justify-between items-center border border-primary/10 mt-4">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-primary">自動核算總額 (Subtotal)</p>
                <p className="text-[10px] text-muted-foreground font-bold">由治理閘道鎖定，作為子項預算之父級約束。</p>
              </div>
              <span className="text-4xl font-mono font-black text-primary">
                ${((editingTask?.quantity || 0) * (editingTask?.unitPrice || 0)).toLocaleString()}
              </span>
            </div>
          </div>
          
          <DialogFooter className="p-8 bg-muted/30 border-t flex gap-4">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-2xl font-black uppercase text-[11px] tracking-widest h-12 px-8">取消操作</Button>
            <Button onClick={handleSaveTask} className="rounded-2xl px-12 shadow-2xl shadow-primary/30 font-black uppercase text-[11px] tracking-widest h-12">同步至維度主權</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
