"use client";

import { useAppStore, Organization } from "@/lib/store";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Check, 
  ChevronsUpDown, 
  Globe, 
  User, 
  Users, 
  ExternalLink 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

export function GlobalSwitcher() {
  const { organizations, activeOrgId, setActiveOrg, addOrganization } = useAppStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgContext, setNewOrgContext] = useState("");

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  const handleCreateOrg = () => {
    if (!newOrgName.trim()) return;
    addOrganization({ 
      name: newOrgName, 
      context: newOrgContext || "General business context" 
    });
    setNewOrgName("");
    setNewOrgContext("");
    setIsCreateOpen(false);
    toast({
      title: "Organization Forged",
      description: `${newOrgName} is now a root directory within your architecture.`,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between shadow-sm border-border/60 hover:bg-accent/10">
            <div className="flex items-center gap-2 truncate">
              {activeOrg.id === 'personal' ? (
                <User className="w-4 h-4 text-primary" />
              ) : activeOrg.isExternal ? (
                <ExternalLink className="w-4 h-4 text-accent" />
              ) : (
                <Users className="w-4 h-4 text-primary" />
              )}
              <span className="truncate font-semibold">{activeOrg.name}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]" align="start">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-widest font-bold px-2 py-1.5">
            Dimensions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem 
              key={org.id} 
              onSelect={() => setActiveOrg(org.id)}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-md",
                  org.id === 'personal' ? "bg-primary/10" : org.isExternal ? "bg-accent/10" : "bg-primary/5"
                )}>
                  {org.id === 'personal' ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : org.isExternal ? (
                    <ExternalLink className="w-4 h-4 text-accent" />
                  ) : (
                    <Users className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{org.name}</span>
                  <span className="text-[10px] text-muted-foreground">{org.role}</span>
                </div>
              </div>
              {activeOrgId === org.id && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer py-2 text-primary focus:text-primary font-medium"
            onSelect={(e) => {
              e.preventDefault();
              setIsCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Forge New Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Forge New Organization</DialogTitle>
            <DialogDescription>
              Build a new resource boundary and define its root logic.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input 
                id="org-name" 
                value={newOrgName} 
                onChange={(e) => setNewOrgName(e.target.value)} 
                placeholder="e.g. Galactic Ventures" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-context">Architectural Context</Label>
              <Input 
                id="org-context" 
                value={newOrgContext} 
                onChange={(e) => setNewOrgContext(e.target.value)} 
                placeholder="e.g. High-tech research lab" 
              />
              <p className="text-[10px] text-muted-foreground">This helps our AI adapt the environment resonance.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrg}>Initiate Forge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}