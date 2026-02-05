"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Layers, 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/page-header";
import { ContainerCard } from "@/components/dashboard/containers/container-card";
import { ContainerListItem } from "@/components/dashboard/containers/container-list-item";
import { CreateContainerDialog } from "./_components/create-container-dialog";

export default function ContainersPage() {
  const { organizations, activeOrgId, containers } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  const orgContainers = containers.filter(c => 
    c.orgId === activeOrgId && 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Logical Containers" 
        description="Modular stacking architecture for your assets."
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg bg-background p-1 shadow-sm">
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
          <Button className="gap-2 shadow-sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" /> Forge Container
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-4 bg-card/50 p-3 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Filter containers..." 
            className="pl-10 h-9 bg-background border-border/40 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Filter className="w-3.5 h-3.5" /> Filter
        </Button>
      </div>

      {orgContainers.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgContainers.map(c => (
              <ContainerCard key={c.id} container={c} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orgContainers.map(c => (
              <ContainerListItem key={c.id} container={c} />
            ))}
          </div>
        )
      ) : (
        <div className="p-20 text-center border-2 border-dashed rounded-3xl bg-muted/10">
          <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
          <h3 className="text-2xl font-bold font-headline mb-2">Architectural Void</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm">
            No logical containers match your current resonance filters or exist in this dimension yet.
          </p>
          <Button size="lg" onClick={() => setIsCreateOpen(true)} className="rounded-full px-8">
            Forge Initial Container
          </Button>
        </div>
      )}

      <CreateContainerDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        activeOrgName={activeOrg.name}
        activeOrgId={activeOrg.id}
      />
    </div>
  );
}
