"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Terminal, 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/page-header";
import { WorkspaceCard } from "@/components/dashboard/workspaces/workspace-card";
import { WorkspaceListItem } from "@/components/dashboard/workspaces/workspace-list-item";
import { CreateWorkspaceDialog } from "./_components/create-workspace-dialog";

/**
 * WorkspacesPage - 職責：管理組織附屬的邏輯空間子單元
 */
export default function WorkspacesPage() {
  const { organizations, activeOrgId, workspaces, deleteWorkspace } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  const orgWorkspaces = workspaces.filter(w => 
    w.orgId === activeOrgId && 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="邏輯空間" 
        description="隸屬於此組織維度的子單元，負責定義獨立的技術邊界與能力規範。"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg bg-background p-1 shadow-sm border-border/60">
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
          <Button className="gap-2 shadow-sm font-bold uppercase tracking-widest text-[11px] h-10 px-4" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" /> 建立空間單元
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-4 bg-card/50 p-3 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="搜尋名稱或上下文..." 
            className="pl-10 h-10 bg-background border-border/40 focus-visible:ring-primary/30 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-10 px-4 gap-2 text-xs font-bold uppercase tracking-widest border-border/60 rounded-xl hover:bg-muted/50">
          <Filter className="w-3.5 h-3.5" /> 篩選
        </Button>
      </div>

      {orgWorkspaces.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgWorkspaces.map(w => (
              <WorkspaceCard key={w.id} workspace={w} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orgWorkspaces.map(w => (
              <WorkspaceListItem key={w.id} workspace={w} onDelete={deleteWorkspace} />
            ))}
          </div>
        )
      ) : (
        <div className="p-24 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
          <Terminal className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
          <h3 className="text-2xl font-bold font-headline mb-2">空間虛無</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm">
            當前維度中沒有符合條件的邏輯子單元。
          </p>
          <Button size="lg" onClick={() => setIsCreateOpen(true)} className="rounded-full px-8 shadow-lg font-bold uppercase tracking-widest text-xs">
            建立初始空間
          </Button>
        </div>
      )}

      <CreateWorkspaceDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        activeOrgName={activeOrg.name}
        activeOrgId={activeOrg.id}
      />
    </div>
  );
}
