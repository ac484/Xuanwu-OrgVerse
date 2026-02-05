
"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ListTodo, Plus, Download, Upload, CloudDownload, Trash2, Globe } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useFirebase } from "@/firebase/provider";
import { ref, getDownloadURL } from "firebase/storage";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function WorkspaceTasks() {
  const { workspace, emitEvent } = useWorkspace();
  const { storage } = useFirebase();
  const { addTaskToWorkspace, updateTaskStatus, importTasksToWorkspace } = useAppStore();
  
  const [newTask, setNewTask] = useState("");
  const [isCloudImportOpen, setIsCloudImportOpen] = useState(false);
  const [cloudPath, setCloudPath] = useState("specs/default-tasks.json");
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTaskToWorkspace(workspace.id, { title: newTask, status: 'todo' });
    emitEvent("建立空間任務", newTask);
    setNewTask("");
    toast({ title: "任務已新增" });
  };

  const handleExport = () => {
    const tasks = workspace.tasks || [];
    if (tasks.length === 0) {
      toast({ title: "無可匯出的數據", description: "請先建立任務後再執行匯出。" });
      return;
    }

    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tasks_${workspace.name.replace(/\s+/g, '_')}_${format(new Date(), "yyyyMMdd")}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    emitEvent("匯出任務規格", `${tasks.length} 項任務`);
    toast({ title: "規格匯出成功", description: "JSON 規格檔案已下載。" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        processImport(json);
      } catch (err) {
        toast({ variant: "destructive", title: "導入失敗", description: "不相容的 JSON 格式。" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCloudImport = async () => {
    setIsCloudLoading(true);
    try {
      const storageRef = ref(storage, cloudPath);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      const json = await response.json();
      
      processImport(json);
      setIsCloudImportOpen(false);
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "雲端匯入失敗", 
        description: "找不到檔案或權限不足。" 
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const processImport = (json: any[]) => {
    if (Array.isArray(json)) {
      importTasksToWorkspace(workspace.id, json);
      emitEvent("匯入任務規格", `${json.length} 項任務`);
      toast({ 
        title: "任務導入成功", 
        description: `已成功同步 ${json.length} 項任務目標。` 
      });
    }
  };

  const tasks = (workspace.tasks || []).filter(t => t.status === 'todo' || t.status === 'completed');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ListTodo className="w-4 h-4" /> 原子任務清單
        </h3>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={handleImport} 
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
            onClick={() => setIsCloudImportOpen(true)}
          >
            <CloudDownload className="w-3.5 h-3.5 mr-1.5" /> 雲端匯入
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> 本地匯入
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
            onClick={handleExport}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> 匯出規格
          </Button>
        </div>
      </div>

      <form onSubmit={handleAddTask} className="flex gap-2">
        <Input 
          placeholder="輸入新的任務目標..." 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)}
          className="bg-card/40 border-border/60 rounded-xl"
        />
        <Button type="submit" size="icon" className="shrink-0 rounded-xl">
          <Plus className="w-5 h-5" />
        </Button>
      </form>

      <div className="space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${task.status === 'completed' ? 'bg-muted/30 opacity-60 border-transparent' : 'bg-card/40 border-border/60'}`}
          >
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={task.status === 'completed'} 
                onCheckedChange={() => {
                  const nextStatus = task.status === 'todo' ? 'completed' : 'todo';
                  updateTaskStatus(workspace.id, task.id, nextStatus);
                  emitEvent(nextStatus === 'completed' ? "完成任務" : "重啟任務", task.title);
                }}
                className="rounded-full"
              />
              <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                {task.title}
              </span>
            </div>
            {task.status === 'completed' && (
              <Badge variant="outline" className="text-[8px] uppercase tracking-tighter">待品檢 (QA)</Badge>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-20">
            <p className="text-xs font-bold uppercase tracking-widest">尚無待辦事項</p>
          </div>
        )}
      </div>

      <Dialog open={isCloudImportOpen} onOpenChange={setIsCloudImportOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" /> 雲端規格匯入
            </DialogTitle>
            <DialogDescription>
              從 Firebase Storage 獲取預定義的技術規格檔案。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Storage 檔案路徑</Label>
              <Input 
                value={cloudPath} 
                onChange={(e) => setCloudPath(e.target.value)} 
                placeholder="例如: specs/engineering-tasks.json" 
              />
              <p className="text-[10px] text-muted-foreground italic">請確保檔案具備公開讀取權限或已配置對應的安全性規則。</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloudImportOpen(false)}>取消</Button>
            <Button onClick={handleCloudImport} disabled={isCloudLoading}>
              {isCloudLoading ? "正在同步..." : "啟動遷移"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
