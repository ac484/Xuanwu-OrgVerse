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
import { toast } from "@/hooks/use-toast";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeOrgName: string;
  activeOrgId: string;
}

export function CreateWorkspaceDialog({ open, onOpenChange, activeOrgName, activeOrgId }: CreateWorkspaceDialogProps) {
  const { addWorkspace } = useAppStore();
  const [name, setName] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const handleCreate = () => {
    if (!name.trim()) return;
    addWorkspace({
      name,
      orgId: activeOrgId,
      visibility: isVisible ? 'visible' : 'hidden',
      boundary: ['驗證', '運算'],
      protocol: '標準存取協議'
    });
    setName("");
    onOpenChange(false);
    toast({
      title: "邏輯空間已建立",
      description: `${name} 現已成為 ${activeOrgName} 中的一個技術節點。`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/60">
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
          <Button onClick={handleCreate}>確認建立</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
