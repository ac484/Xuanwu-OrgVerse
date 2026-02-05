"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ListTodo, Plus, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export function WorkspaceTasks() {
  const { workspace, emitEvent } = useWorkspace();
  const { addTaskToWorkspace, toggleTaskStatus } = useAppStore();
  const [newTask, setNewTask] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTaskToWorkspace(workspace.id, { title: newTask, status: 'todo' });
    emitEvent("建立空間任務", newTask);
    setNewTask("");
    toast({ title: "任務已新增" });
  };

  const tasks = workspace.tasks || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ListTodo className="w-4 h-4" /> 原子任務清單
        </h3>
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
            className={`flex items-center gap-3 p-4 border rounded-2xl transition-all ${task.status === 'done' ? 'bg-muted/30 opacity-60 border-transparent' : 'bg-card/40 border-border/60'}`}
          >
            <Checkbox 
              checked={task.status === 'done'} 
              onCheckedChange={() => {
                toggleTaskStatus(workspace.id, task.id);
                emitEvent(task.status === 'todo' ? "完成任務" : "重啟任務", task.title);
              }}
              className="rounded-full"
            />
            <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through' : ''}`}>
              {task.title}
            </span>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-20">
            <p className="text-xs font-bold uppercase tracking-widest">尚無待辦事項</p>
          </div>
        )}
      </div>
    </div>
  );
}
