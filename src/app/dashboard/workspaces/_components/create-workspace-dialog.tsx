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
  const [context, setContext] = useState("標準運行時-v1");
  const [policy, setPolicy] = useState("嚴格隔離策略-v1");

  const handleCreate = () => {
    if (!name.trim()) return;
    addWorkspace({
      name,
      orgId: activeOrgId,
      context,
      policy,
      scope: ['驗證', '運算'],
      resolver: '標準閘道器'
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
            在 {activeOrgName} 維度中定義一個新的技術環境與邊界。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>空間名稱</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="例如: 核心解析空間" 
            />
          </div>
          <div className="space-y-2">
            <Label>運行環境 (Runtime Context)</Label>
            <Input 
              value={context} 
              onChange={(e) => setContext(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>安全策略 (Security Policy)</Label>
            <Input 
              value={policy} 
              onChange={(e) => setPolicy(e.target.value)} 
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