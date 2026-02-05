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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [type, setType] = useState<'project' | 'resource' | 'sandbox'>('project');

  const handleCreate = () => {
    if (!name.trim()) return;
    addContainer({
      name,
      type,
      orgId: activeOrgId
    });
    setName("");
    onOpenChange(false);
    toast({
      title: "Container Established",
      description: `${name} is now active within ${activeOrgName}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Forge Container</DialogTitle>
          <DialogDescription>
            Establish a new logical boundary within {activeOrgName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Container Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Q3 Marketing Pipeline" 
            />
          </div>
          <div className="space-y-2">
            <Label>Container Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project Container</SelectItem>
                <SelectItem value="resource">Resource Hub</SelectItem>
                <SelectItem value="sandbox">Personal Sandbox</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Forge</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
