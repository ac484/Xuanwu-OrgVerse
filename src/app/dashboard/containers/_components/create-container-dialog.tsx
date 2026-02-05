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

interface CreateContainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeOrgName: string;
  activeOrgId: string;
}

export function CreateContainerDialog({ open, onOpenChange, activeOrgName, activeOrgId }: CreateContainerDialogProps) {
  const { addContainer } = useAppStore();
  const [name, setName] = useState("");
  const [context, setContext] = useState("runtime-standard-v1");
  const [policy, setPolicy] = useState("strict-isolation-v1");

  const handleCreate = () => {
    if (!name.trim()) return;
    addContainer({
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
      title: "Infrastructure established",
      description: `${name} is now a logical boundary in ${activeOrgName}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Forge Infrastructure</DialogTitle>
          <DialogDescription>
            Establish a new logical boundary within {activeOrgName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Designation</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Q3 Analytics Node" 
            />
          </div>
          <div className="space-y-2">
            <Label>Runtime Context</Label>
            <Input 
              value={context} 
              onChange={(e) => setContext(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Security Policy</Label>
            <Input 
              value={policy} 
              onChange={(e) => setPolicy(e.target.value)} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Establish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
