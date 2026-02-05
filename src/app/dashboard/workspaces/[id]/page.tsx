"use client";

import { useAppStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Settings, 
  Zap, 
  Terminal,
  Globe,
  Database,
  Code,
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Box,
  Layout,
  Activity,
  Users,
  FileText,
  Search,
  UploadCloud,
  ChevronRight,
  Clock,
  Download
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { WorkspaceProvider, useWorkspace } from "./workspace-context";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * WorkspaceDetailPage - 職責：深度管理特定的邏輯空間
 * UI/UX 優化：引入現代化的視覺層級與堆疊式能力管理。
 */
export default function WorkspaceDetailPage() {
  const { id } = useParams();
  
  return (
    <WorkspaceProvider workspaceId={id as string}>
      <WorkspaceContent />
    </WorkspaceProvider>
  );
}

function WorkspaceContent() {
  const { workspace, protocol, scope, emitEvent } = useWorkspace();
  const { 
    organizations, 
    activeOrgId,
    pulseLogs,
    updateWorkspace, 
    addCapabilityToWorkspace, 
    removeCapabilityFromWorkspace,
    deleteWorkspace
  } = useAppStore();
  
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isAddCapOpen, setIsAddCapOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const router = useRouter();

  const activeOrg = organizations.find(o => o.id === activeOrgId);
  const localPulse = (pulseLogs || []).filter(log => log.target.includes(workspace.name)).slice(0, 8);
  const assignedTeams = activeOrg?.teams?.filter(t => (workspace?.teamIds || []).includes(t.id)) || [];

  const [editName, setEditName] = useState("");
  const [editVisibility, setEditVisibility] = useState<"visible" | "hidden">("visible");
  const [editProtocol, setEditProtocol] = useState("");
  const [editScope, setEditScope] = useState("");

  useEffect(() => {
    setMounted(true);
    if (workspace) {
      setEditName(workspace.name);
      setEditVisibility(workspace.visibility);
      setEditProtocol(workspace.protocol);
      setEditScope((workspace.scope || []).join(", "));
    }
  }, [workspace]);

  if (!mounted) return null;

  const handleUpdateSettings = () => {
    updateWorkspace(workspace.id, { name: editName, visibility: editVisibility });
    emitEvent("校準主權設定", editName);
    setIsSettingsOpen(false);
    toast({ title: "空間規格已同步" });
  };

  const handleUpdateSpecs = () => {
    updateWorkspace(workspace.id, {
      protocol: editProtocol,
      scope: editScope.split(",").map(s => s.trim()).filter(Boolean)
    });
    emitEvent("重定義協議範疇", editProtocol);
    setIsSpecsOpen(false);
    toast({ title: "授權範疇已重定義" });
  };

  const handleAddCapability = (capType: 'ui' | 'api' | 'data') => {
    const caps = {
      ui: { name: '新 UI 單元', description: '自定義的原子化視覺組件。' },
      api: { name: '新 API 接口', description: '標準化的數據交換邏輯。' },
      data: { name: '新數據帳本', description: '具備主權追蹤能力的持久化層。' }
    };
    
    addCapabilityToWorkspace(workspace.id, { ...caps[capType], type: capType, status: "beta" });
    emitEvent("掛載原子能力", caps[capType].name);
    setIsAddCapOpen(false);
    toast({ title: "原子能力已掛載" });
  };

  const handleDeleteWorkspace = () => {
    deleteWorkspace(workspace.id);
    router.push("/dashboard/workspaces");
    toast({ title: "空間已銷毀", description: "該空間的所有技術規格已抹除。" });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ui': return <Layout className="w-5 h-5" />;
      case 'api': return <Code className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 hover:bg-primary/5">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span>邏輯空間</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">{workspace.name}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive border-destructive/20 hover:bg-destructive/5 font-bold uppercase text-[10px] tracking-widest shadow-sm"
          onClick={() => setIsDeleteConfirmOpen(true)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" /> 銷毀空間
        </Button>
      </div>

      <PageHeader 
        title={workspace.name} 
        description="管理此空間的原子能力堆疊與存取治理協議。"
        badge={
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-[0.1em] font-bold px-2 py-0.5 shadow-sm">
              ID: {workspace.id.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-[9px] uppercase font-bold flex items-center gap-1 bg-background/50 backdrop-blur-sm">
              {workspace.visibility === 'visible' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {workspace.visibility === 'visible' ? '已掛載' : '隔離中'}
            </Badge>
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest shadow-sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-3.5 h-3.5" /> 空間設定
          </Button>
          <Button size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" onClick={() => setIsSpecsOpen(true)}>
            <Zap className="w-3.5 h-3.5" /> 調整規格
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Tabs defaultValue="capabilities" className="space-y-6">
            <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl">
              <TabsTrigger value="capabilities" className="text-[10px] font-bold uppercase tracking-widest px-8 rounded-lg">能力堆疊</TabsTrigger>
              <TabsTrigger value="documents" className="text-[10px] font-bold uppercase tracking-widest px-8 rounded-lg">維度文檔</TabsTrigger>
              <TabsTrigger value="members" className="text-[10px] font-bold uppercase tracking-widest px-8 rounded-lg">存取治理</TabsTrigger>
              <TabsTrigger value="specs" className="text-[10px] font-bold uppercase tracking-widest px-8 rounded-lg">技術規格</TabsTrigger>
            </TabsList>

            <TabsContent value="capabilities" className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Box className="w-4 h-4" /> 原子能力堆疊
                </h3>
                <Button size="sm" variant="outline" className="h-8 gap-2 font-bold text-[9px] uppercase tracking-widest" onClick={() => setIsAddCapOpen(true)}>
                  <Plus className="w-3 h-3" /> 註冊能力
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(workspace.capabilities || []).map((cap) => (
                  <Card key={cap.id} className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all group bg-card/40 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                          {getIcon(cap.type)}
                        </div>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 bg-background">
                          {cap.status === 'stable' ? 'PRODUCTION' : 'BETA'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">{cap.name}</CardTitle>
                      <CardDescription className="text-[11px] mt-1 leading-relaxed">{cap.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="border-t border-border/10 flex justify-between items-center py-4 bg-muted/5">
                      <span className="text-[9px] font-mono text-muted-foreground opacity-60">ID: {cap.id.toUpperCase()}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeCapabilityFromWorkspace(workspace.id, cap.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                {(workspace.capabilities || []).length === 0 && (
                  <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
                    <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                    <p className="text-sm text-muted-foreground font-medium">尚未在空間中掛載原子化能力。</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="animate-in fade-in duration-300">
              <WorkspaceDocuments />
            </TabsContent>

            <TabsContent value="members" className="space-y-8 animate-in fade-in duration-300">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" /> 共振團隊授權
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedTeams.map(team => (
                    <div key={team.id} className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between hover:bg-primary/10 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary"><Users className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs font-bold">{team.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{(team.memberIds || []).length} 名成員已共振</p>
                        </div>
                      </div>
                      <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity rotate-180" />
                    </div>
                  ))}
                  {assignedTeams.length === 0 && (
                    <div className="col-span-full p-12 border-2 border-dashed rounded-2xl text-center opacity-40">
                      <p className="text-[10px] font-bold uppercase tracking-widest">無任何團隊掛載至此空間</p>
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="specs" className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/60 shadow-sm bg-card/30 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-between text-primary">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        授權範疇 (Scope)
                      </div>
                    </CardTitle>
                    <CardDescription className="text-[11px]">定義此空間內原子能力的資源調用邊界。</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {(scope || []).map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] uppercase tracking-tighter px-2 py-0.5 bg-primary/5 text-primary border-primary/20">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm bg-card/30 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-between text-primary">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        存取協議 (Protocol)
                      </div>
                    </CardTitle>
                    <CardDescription className="text-[11px]">空間內所有能力的統一通訊與治理契約。</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="p-4 bg-muted/50 rounded-xl border border-border/40 shadow-inner">
                      <p className="text-xs font-mono font-bold text-primary">{protocol}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
            <CardHeader className="pb-3 bg-primary/5 border-b">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary animate-pulse" /> 空間脈動 (Local)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-border/40">
                  {(localPulse || []).map((log) => (
                    <div key={log.id} className="p-4 hover:bg-primary/5 transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold leading-tight group-hover:text-primary transition-colors">
                          {log.action}
                        </p>
                        <time className="text-[8px] text-muted-foreground/60 font-mono">{format(log.timestamp, "HH:mm:ss")}</time>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {log.actor}
                        </span>
                        <Badge variant="ghost" className="text-[7px] h-3 px-1 border-none opacity-40 group-hover:opacity-100 uppercase tracking-tighter">Event</Badge>
                      </div>
                    </div>
                  ))}
                  {(localPulse || []).length === 0 && (
                    <div className="p-12 text-center opacity-30 italic text-[10px]">
                      尚無本地活動共振。
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 彈窗：空間設定 */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">空間主權設定</DialogTitle>
            <DialogDescription>調整此邏輯空間的識別資訊與可見性治理策略。</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">空間名稱</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/60">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">空間可見性</Label>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                  {editVisibility === 'visible' ? '已掛載至維度目錄' : '受限隔離模式 (僅 ID 存取)'}
                </p>
              </div>
              <Switch 
                checked={editVisibility === 'visible'} 
                onCheckedChange={(checked) => setEditVisibility(checked ? 'visible' : 'hidden')} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)} className="rounded-xl">取消</Button>
            <Button onClick={handleUpdateSettings} className="rounded-xl px-8">儲存變動</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 彈窗：調整規格 */}
      <Dialog open={isSpecsOpen} onOpenChange={setIsSpecsOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">重定義技術規格</DialogTitle>
            <DialogDescription>修改此空間的通訊協議與資源授權範疇。</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">存取協議 (Protocol)</Label>
              <Input value={editProtocol} onChange={(e) => setEditProtocol(e.target.value)} placeholder="例如: gRPC-Web / RESTful-v2" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">授權範疇 (Scope)</Label>
              <Input value={editScope} onChange={(e) => setEditScope(e.target.value)} placeholder="以逗號分隔，例如: auth, compute, storage" className="rounded-xl h-11" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpecsOpen(false)} className="rounded-xl">取消</Button>
            <Button onClick={handleUpdateSpecs} className="rounded-xl px-8">確認重定義</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 彈窗：註冊原子能力 */}
      <Dialog open={isAddCapOpen} onOpenChange={setIsAddCapOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">掛載原子能力</DialogTitle>
            <DialogDescription>在此空間中掛載新的技術規範單元，擴展維度功能。</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button variant="outline" className="justify-start h-20 gap-4 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all group" onClick={() => handleAddCapability('ui')}>
              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><Layout className="w-6 h-6" /></div>
              <div className="text-left">
                <p className="text-sm font-bold uppercase tracking-tight">UI 視覺單元</p>
                <p className="text-[10px] text-muted-foreground uppercase leading-tight mt-0.5">掛載原子化前端組件與交互介面</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-20 gap-4 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all group" onClick={() => handleAddCapability('api')}>
              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><Code className="w-6 h-6" /></div>
              <div className="text-left">
                <p className="text-sm font-bold uppercase tracking-tight">API 邏輯接口</p>
                <p className="text-[10px] text-muted-foreground uppercase leading-tight mt-0.5">掛載標準化交換協議與業務邏輯</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-20 gap-4 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all group" onClick={() => handleAddCapability('data')}>
              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><Database className="w-6 h-6" /></div>
              <div className="text-left">
                <p className="text-sm font-bold uppercase tracking-tight">DATA 數據帳本</p>
                <p className="text-[10px] text-muted-foreground uppercase leading-tight mt-0.5">掛載具備審計能力的持久化存儲單元</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 彈窗：銷毀確認 */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive font-headline text-xl flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> 啟動空間銷毀協議
            </DialogTitle>
            <DialogDescription className="pt-2">
              此操作將永久抹除空間「{workspace.name}」及其下屬的所有技術規格與授權配置。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 p-4 bg-destructive/5 rounded-2xl border border-destructive/20">
            <p className="text-[11px] text-destructive font-medium italic">
              一旦執行，所有與此空間關聯的數據與身分共振軌跡將永久消失且無法恢復。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="rounded-xl">取消</Button>
            <Button variant="destructive" onClick={handleDeleteWorkspace} className="rounded-xl px-8">確認銷毀</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * WorkspaceDocuments - 職責：管理空間內的文檔資產
 * UI/UX 優化：具備治理感的列表與詳細元數據展示。
 */
function WorkspaceDocuments() {
  const { workspace, emitEvent, scope } = useWorkspace();
  const [search, setSearch] = useState("");
  
  const mockDocs = [
    { id: 'doc-1', name: '維度架構規格書_v2.pdf', type: 'SPEC', size: '1.2MB', author: 'System', date: '2024-03-20' },
    { id: 'doc-2', name: '存取協議治理草案_FINAL.docx', type: 'GOV', size: '450KB', author: 'Admin', date: '2024-03-22' },
    { id: 'doc-3', name: '原子能力掛載指南.pdf', type: 'GUIDE', size: '2.8MB', author: 'Researcher', date: '2024-03-25' },
  ];

  const handleRegisterDoc = () => {
    emitEvent("文檔資產註冊", "新規格草案.pdf");
    toast({
      title: "文檔已註冊",
      description: "新的文檔規格已掛載至空間存儲範疇。",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="在授權範疇內搜尋文檔..." 
            className="pl-10 h-11 bg-card/40 border-border/60 rounded-xl focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button className="gap-2 font-bold uppercase text-[10px] tracking-widest h-11 px-6 rounded-xl shadow-lg shadow-primary/10" onClick={handleRegisterDoc}>
          <UploadCloud className="w-4 h-4" /> 註冊文檔
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {mockDocs.map(doc => (
          <div key={doc.id} className="p-4 bg-card/40 border border-border/60 rounded-2xl hover:bg-primary/5 transition-all group flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{doc.name}</h4>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[8px] h-4 px-1.5 font-bold uppercase tracking-widest bg-background">
                    {doc.type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> {doc.size}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {doc.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block mr-2">
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">註冊者</p>
                <p className="text-[10px] font-bold">{doc.author}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {mockDocs.length === 0 && (
          <div className="p-24 text-center border-2 border-dashed rounded-3xl opacity-20">
            <FileText className="w-12 h-12 mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">無文檔資產</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Box className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">授權範疇與治理聲明</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            此空間當前具備 [{(scope || []).join(", ")}] 範疇授權。所有註冊的文檔資產均需符合此技術邊界。文檔的操作紀錄將被即時同步至維度脈動系統。
          </p>
        </div>
      </div>
    </div>
  );
}