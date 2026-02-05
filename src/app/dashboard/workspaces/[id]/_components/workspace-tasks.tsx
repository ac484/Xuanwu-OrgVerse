"use client";

import { useWorkspace } from "../workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ListTodo, Plus, Download, Upload, CloudDownload, Globe } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
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
  const { db, storage } = useFirebase();
  const [newTask, setNewTask] = useState("");
  const [isCloudImportOpen, setIsCloudImportOpen] = useState(false);
  const [cloudPath, setCloudPath] = useState("specs/default-tasks.json");
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用真正的 Firestore 實時偵聽子集合
  const tasksQuery = query(
    collection(db, "workspaces", workspace.id, "tasks"),
    orderBy("createdAt", "asc")
  );
  const { data: tasks } = useCollection<any>(tasksQuery);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const taskData = {
      title: newTask,
      status: 'todo',
      createdAt: serverTimestamp()
    };

    const tasksCol = collection(db, "workspaces", workspace.id, "tasks");
    addDoc(tasksCol, taskData)
      .then(() => {
        emitEvent("建立空間任務", newTask);
        setNewTask("");
        toast({ title: "任務已新增" });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `workspaces/${workspace.id}/tasks`,
          operation: 'create',
          requestResourceData: taskData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleUpdateStatus = (taskId: string, currentStatus: string, title: string) => {
    const nextStatus = currentStatus === 'todo' ? 'completed' : 'todo';
    const taskRef = doc(db, "workspaces", workspace.id, "tasks", taskId);

    updateDoc(taskRef, { status: nextStatus })
      .then(() => {
        emitEvent(nextStatus === 'completed' ? "完成任務" : "重啟任務", title);
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: taskRef.path,
          operation: 'update',
          requestResourceData: { status: nextStatus }
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleCloudImport = async () => {
    setIsCloudLoading(true);
    try {
      const storageRef = ref(storage, cloudPath);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      const json = await response.json();
      
      if (Array.isArray(json)) {
        const tasksCol = collection(db, "workspaces", workspace.id, "tasks");
        json.forEach(t => {
          addDoc(tasksCol, { 
            title: t.title, 
            status: t.status || 'todo', 
            createdAt: serverTimestamp() 
          });
        });
        emitEvent("匯入任務規格", `${json.length} 項任務`);
        toast({ title: "任務導入成功" });
        setIsCloudImportOpen(false);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "雲端匯入失敗", description: "請確認權限或檔案路徑。" });
    } finally {
      setIsCloudLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ListTodo className="w-4 h-4" /> 原子任務清單 (Cloud Sync)
        </h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
            onClick={() => setIsCloudImportOpen(true)}
          >
            <CloudDownload className="w-3.5 h-3.5 mr-1.5" /> 雲端匯入
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
        {tasks?.map(task => (
          <div 
            key={task.id} 
            className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${task.status === 'completed' ? 'bg-muted/30 opacity-60 border-transparent' : 'bg-card/40 border-border/60'}`}
          >
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={task.status === 'completed'} 
                onCheckedChange={() => handleUpdateStatus(task.id, task.status, task.title)}
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
        {(!tasks || tasks.length === 0) && (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-20">
            <p className="text-xs font-bold uppercase tracking-widest">尚無同步任務</p>
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
              從 Firebase Storage 獲取 JSON 技術規格檔案。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Storage 檔案路徑</Label>
              <Input 
                value={cloudPath} 
                onChange={(e) => setCloudPath(e.target.value)} 
                placeholder="例如: specs/engineering-tasks.json" 
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloudImportOpen(false)}>取消</Button>
            <Button onClick={handleCloudImport} disabled={isCloudLoading} className="rounded-xl">
              {isCloudLoading ? "同步中..." : "啟動遷移"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
