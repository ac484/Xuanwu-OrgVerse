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
  ChevronRight,
  Clock,
  FileText,
  ListTodo,
  AlertCircle,
  MessageSquare
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

import { WorkspaceFiles } from "./_components/workspace-files";
import { WorkspaceTasks } from "./_components/workspace-tasks";
import { WorkspaceIssues } from "./_components/workspace-issues";
import { WorkspaceDaily } from "./_components/workspace-daily";
import { WorkspaceMembersManagement } from "./_components/workspace-members-management";

/**
 * WorkspaceDetailPage - 職責：深度管理特定的邏輯空間
 * 已重構：UI 標籤頁現在完全由「已掛載的原子能力」動態驅動。
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
  const localPulse = (pulseLogs || []).filter(log => log.target.includes(workspace.name)).slice(0, 10);

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

  const handleDeleteWorkspace = () => {
    deleteWorkspace(workspace.id);
    router.push("/dashboard/workspaces");
    toast({ 
      title: "空間已銷毀", 
      description: "相關的技術規格與數據已從維度中抹除。" 
    });
  };

  const handleAddCapability = (capKey: string) => {
    const capTemplates: Record<string, any> = {
      'files': { name: '檔案空間', type: 'data', description: '管理維度內的文檔與資產。' },
      'tasks': { name: '原子任務', type: 'ui', description: '追蹤空間內的行動目標。' },
      'issues': { name: '議題追蹤', type: 'ui', description: '回報並處理技術衝突。' },
      'daily': { name: '每日動態', type: 'ui', description: '極簡的技術協作日誌牆。' },
    };
    
    const template = capTemplates[capKey];
    if (template) {
      addCapabilityToWorkspace(workspace.id, { ...template, id: capKey, status: "stable" });
      emitEvent("掛載原子能力", template.name);
      setIsAddCapOpen(false);
      toast({ title: `${template.name} 已掛載` });
    }
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'files': return <FileText className="w-5 h-5" />;
      case 'tasks': return <ListTodo className="w-5 h-5" />;
      case 'issues': return <AlertCircle className="w-5 h-5" />;
      case 'daily': return <MessageSquare className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const mountedCapIds = (workspace.capabilities || []).map(c => c.id);

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
          className="text-destructive border-destructive/20 hover:bg-destructive/5 font-bold uppercase text-[10px] tracking-widest"
          onClick={() => setIsDeleteConfirmOpen(true)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" /> 銷毀空間
        </Button>
      </div>

      <PageHeader 
        title={workspace.name} 
        description="管理此空間的原子能力堆疊、資料交換與治理協議。"
        badge={
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-[0.1em] font-bold px-2 py-0.5">
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
          <Button variant="outline" size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsSettingsOpen(true)}>
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
            <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl w-full flex overflow-x-auto justify-start no-scrollbar">
              <TabsTrigger value="capabilities" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">能力清單</TabsTrigger>
              {mountedCapIds.includes('files') && <TabsTrigger value="files" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">檔案</TabsTrigger>}
              {mountedCapIds.includes('tasks') && <TabsTrigger value="tasks" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">任務</TabsTrigger>}
              {mountedCapIds.includes('issues') && <TabsTrigger value="issues" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">議題</TabsTrigger>}
              {mountedCapIds.includes('daily') && <TabsTrigger value="daily" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">動態牆</TabsTrigger>}
              <TabsTrigger value="members" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">存取治理</TabsTrigger>
              <TabsTrigger value="specs" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">技術規格</TabsTrigger>
            </TabsList>

            <TabsContent value="capabilities" className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Box className="w-4 h-4" /> 已掛載單元
                </h3>
                <Button size="sm" variant="outline" className="h-8 gap-2 font-bold text-[9px] uppercase tracking-widest" onClick={() => setIsAddCapOpen(true)}>
                  <Plus className="w-3 h-3" /> 掛載能力
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(workspace.capabilities || []).map((cap) => (
                  <Card key={cap.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          {getIcon(cap.id)}
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
                  <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl opacity-20">
                    <Box className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">此空間尚未掛載任何能力</p>
                    <Button variant="link" onClick={() => setIsAddCapOpen(true)} className="mt-2 text-primary font-bold">立即掛載</Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="files"><WorkspaceFiles /></TabsContent>
            <TabsContent value="tasks"><WorkspaceTasks /></TabsContent>
            <TabsContent value="issues"><WorkspaceIssues /></TabsContent>
            <TabsContent value="daily"><WorkspaceDaily /></TabsContent>
            <TabsContent value="members"><WorkspaceMembersManagement /></TabsContent>

            <TabsContent value="specs" className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/60 shadow-sm bg-card/30 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-between text-primary">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" /> 授權範疇 (Scope)
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {(scope || []).map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] uppercase tracking-tighter px-2 py-0.5 bg-primary/5 text-primary border-primary/20">{s}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm bg-card/30 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-between text-primary">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4" /> 存取協議 (Protocol)
                      </div>
                    </CardTitle>
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
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">空間主權設定</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">空間名稱</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/60">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">空間可見性</Label>
              </div>
              <Switch checked={editVisibility === 'visible'} onCheckedChange={(checked) => setEditVisibility(checked ? 'visible' : 'hidden')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>取消</Button>
            <Button onClick={handleUpdateSettings}>儲存變動</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSpecsOpen} onOpenChange={setIsSpecsOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">重定義技術規格</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">存取協議 (Protocol)</Label>
              <Input value={editProtocol} onChange={(e) => setEditProtocol(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">授權範疇 (Scope)</Label>
              <Input value={editScope} onChange={(e) => setEditScope(e.target.value)} className="rounded-xl h-11" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpecsOpen(false)}>取消</Button>
            <Button onClick={handleUpdateSpecs}>確認重定義</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCapOpen} onOpenChange={setIsAddCapOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">掛載原子能力</DialogTitle>
            <DialogDescription>選取要堆疊至此維度空間的技術單元。</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            {[
              { id: 'files', name: '檔案空間', icon: <FileText className="w-6 h-6" />, desc: '文檔資產管理單元' },
              { id: 'tasks', name: '原子任務', icon: <ListTodo className="w-6 h-6" />, desc: '行動目標追蹤單元' },
              { id: 'issues', name: '議題追蹤', icon: <AlertCircle className="w-6 h-6" />, desc: '技術衝突回報單元' },
              { id: 'daily', name: '每日動態', icon: <MessageSquare className="w-6 h-6" />, desc: '技術協作日誌牆' },
            ].map((cap) => (
              <Button 
                key={cap.id} 
                variant="outline" 
                className={`justify-start h-20 gap-4 rounded-2xl hover:bg-primary/5 group ${mountedCapIds.includes(cap.id) ? 'opacity-50 grayscale pointer-events-none' : ''}`} 
                onClick={() => handleAddCapability(cap.id)}
              >
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  {cap.icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold uppercase">{cap.name}</p>
                    {mountedCapIds.includes(cap.id) && <Badge className="text-[8px] h-3.5 px-1 bg-green-500/20 text-green-600 border-none">已掛載</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{cap.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive font-headline text-xl">啟動空間銷毀協議</DialogTitle>
          </DialogHeader>
          <div className="py-4 p-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-[11px] text-destructive italic">
            此操作將永久抹除空間「{workspace.name}」及其下屬的所有技術規格與數據。
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleDeleteWorkspace}>確認銷毀</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
