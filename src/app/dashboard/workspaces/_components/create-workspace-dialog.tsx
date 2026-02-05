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
  const [context, setContext] = useState("runtime-standard-v1");
  const [policy, setPolicy] = useState("strict-isolation-v1");

  const handleCreate = () => {
    if (!name.trim()) return;
    addWorkspace({
      name,
      orgId: activeOrgId,
      context,
      policy,
      scope: ['auth', 'compute'],
      resolver: 'standard-gateway'
    });
    setName("");
    onOpenChange(false);
    toast({
      title: "邏輯邊界已建立",
      description: `${name} 現已成為 ${activeOrgName} 中的一個技術節點。`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">建立邏輯空間</DialogTitle>
          <DialogDescription>
            在 {activeOrgName} 中定義一個新的技術環境與邊界。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>空間標記 (Designation)</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="例如: Q3 數據解析節點" 
            />
          </div>
          <div className="space-y-2">
            <Label>運行上下文 (Runtime Context)</Label>
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
          <Button onClick={handleCreate}>建立節點</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
