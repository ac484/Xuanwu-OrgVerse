"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Layers, 
  Box, 
  Search, 
  Filter, 
  MoreVertical, 
  LayoutGrid, 
  List as ListIcon,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function ContainersPage() {
  const { organizations, activeOrgId, containers, addContainer } = useAppStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newContainerName, setNewContainerName] = useState("");
  const [newContainerType, setNewContainerType] = useState<'project' | 'resource' | 'sandbox'>('project');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  const orgContainers = containers.filter(c => c.orgId === activeOrgId);

  const handleCreateContainer = () => {
    if (!newContainerName.trim()) return;
    addContainer({
      name: newContainerName,
      type: newContainerType,
      orgId: activeOrgId!
    });
    setNewContainerName("");
    setIsCreateOpen(false);
    toast({
      title: "Container Established",
      description: `${newContainerName} is now active within ${activeOrg.name}.`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Logical Containers</h1>
          <p className="text-muted-foreground">Modular stacking architecture for your assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg bg-background p-1">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Forge Container
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Forge Container</DialogTitle>
                <DialogDescription>
                  Establish a new logical boundary within {activeOrg.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Container Name</Label>
                  <Input 
                    value={newContainerName} 
                    onChange={(e) => setNewContainerName(e.target.value)} 
                    placeholder="e.g. Q3 Marketing Pipeline" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Container Type</Label>
                  <Select value={newContainerType} onValueChange={(v: any) => setNewContainerType(v)}>
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
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateContainer}>Forge</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-muted/40 p-3 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Filter containers..." className="pl-10 h-9 bg-background border-none focus-visible:ring-1" />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Filter className="w-3.5 h-3.5" /> Filter
        </Button>
      </div>

      {orgContainers.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
          {orgContainers.map((container) => (
            viewMode === 'grid' ? (
              <Card key={container.id} className="group border-border/60 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Box className="w-5 h-5" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="mt-4 font-headline">{container.name}</CardTitle>
                  <CardDescription>Logical boundary established recently.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize text-[10px] tracking-widest">{container.type}</Badge>
                    <Badge variant="outline" className="text-[10px] tracking-widest">Active</Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">ID: {container.id}</span>
                  <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold">U{i}</div>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <div key={container.id} className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/5 rounded-lg text-primary">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{container.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-tighter">Type: {container.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sovereignty</p>
                    <p className="text-xs font-medium">99.9% Isolated</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="p-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
          <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
          <h3 className="text-2xl font-bold font-headline mb-2">Architectural Void</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            You haven't forged any logical containers in this dimension yet.
          </p>
          <Button size="lg" onClick={() => setIsCreateOpen(true)} className="rounded-full px-8">
            Forge Initial Container
          </Button>
        </div>
      )}
    </div>
  );
}