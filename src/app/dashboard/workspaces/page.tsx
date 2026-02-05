"use client";

import { useState, useEffect, useMemo, useDeferredValue } from "react";
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
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { WorkspaceListItem } from "@/components/workspaces/workspace-list-item";
import { CreateWorkspaceDialog } from "./_components/create-workspace-dialog";

/**
 * WorkspacesPage - 職責：管理維度附屬的邏輯空間子單元。
 * 原子級最佳化：
 * 1. 引入用 useDeferredValue 處理搜尋結果，確保在高負載下輸入框不卡頓。
 * 2. 使用精準 Selector 訂閱 Store，減少因其他狀態變動觸發的無謂重繪。
 */
export default function WorkspacesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [mounted, setMounted] = useState(false);

  // 精準選擇器模式：僅訂閱必要狀態
  const organizations = useAppStore(state => state.organizations);
  const activeOrgId = useAppStore(state => state.activeOrgId);
  const workspaces = useAppStore(state => state.workspaces);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOrg = useMemo(() => 
    (organizations || []).find(o => o.id === activeOrgId) || organizations[0],
    [organizations, activeOrgId]
  );

  // 效能加固：基於延遲值的過濾邏輯
  const orgWorkspaces = useMemo(() => 
    (workspaces || []).filter(w => 
      w.orgId === activeOrgId && 
      w.name.toLowerCase().includes(deferredSearch.toLowerCase())
    ),
    [workspaces, activeOrgId, deferredSearch]
  );

  if (!mounted || !activeOrg) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 gpu-accelerated">
      <PageHeader 
        title="邏輯空間" 
        description="定義獨立的技術邊界、存取協議與原子能力規範。"
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
            <Plus className="w-4 h-4" /> 建立空間
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-4 bg-card/50 p-3 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="搜尋空間名稱..." 
            className="pl-10 h-10 bg-background border-border/40 focus-visible:ring-primary/30 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-10 px-4 gap-2 text-xs font-bold uppercase tracking-widest border-border/60 rounded-xl">
          <Filter className="w-3.5 h-3.5" /> 篩選
        </Button>
      </div>

      {orgWorkspaces.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
          {orgWorkspaces.map(w => (
            viewMode === 'grid' 
              ? <WorkspaceCard key={w.id} workspace={w} /> 
              : <WorkspaceListItem key={w.id} workspace={w} />
          ))}
        </div>
      ) : (
        <div className="p-24 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
          <Terminal className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
          <h3 className="text-2xl font-bold font-headline mb-2">空間虛無</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm">
            當前維度中沒有符合條件的邏輯單元。
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
