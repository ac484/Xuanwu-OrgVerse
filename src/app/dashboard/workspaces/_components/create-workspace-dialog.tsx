"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { WorkspaceStatus } from "@/types/domain";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeOrgName: string;
  activeOrgId: string;
}

export function CreateWorkspaceDialog({ open, onOpenChange, activeOrgName, activeOrgId }: CreateWorkspaceDialogProps) {
  const { db } = useFirebase();
  const { user } = useAppStore();
  const [name, setName] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [status, setStatus] = useState<WorkspaceStatus>("preparatory");

  const handleCreate = () => {
    if (!name.trim() || !user) return;

    const workspaceData = {
      name,
      orgId: activeOrgId,
      ownerId: user.id,
      status,
      visibility: isVisible ? 'visible' : 'hidden',
      protocol: '標準存取協議',
      scope: ['驗證', '運算'],
      createdAt: serverTimestamp(),
      capabilities: []
    };

    // 遵循規範：非阻塞寫入，不使用 await
    const colRef = collection(db, "workspaces");
    addDoc(colRef, workspaceData)
      .then(() => {
        setName("");
        onOpenChange(false);
        toast({ title: "邏輯空間已建立", description: `${name} 已同步至雲端。` });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'workspaces',
          operation: 'create',
          requestResourceData: workspaceData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">建立邏輯空間</DialogTitle>
          <DialogDescription>
            在 {activeOrgName} 維度中定義一個新的技術環境與資源邊界。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>空間名稱</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="例如: 核心解析空間" 
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>初始狀態</Label>
            <Select value={status} onValueChange={(v: WorkspaceStatus) => setStatus(v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preparatory">籌備 (Preparatory)</SelectItem>
                <SelectItem value="active">啟動 (Active)</SelectItem>
                <SelectItem value="stopped">停止 (Stopped)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/60">
            <div className="space-y-0.5">
              <Label className="text-base">空間可見性</Label>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                {isVisible ? '公開顯示於維度目錄' : '僅對授權人員隱藏顯示'}
              </p>
            </div>
            <Switch 
              checked={isVisible} 
              onCheckedChange={setIsVisible} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleCreate} className="rounded-xl shadow-lg shadow-primary/20">確認建立</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}