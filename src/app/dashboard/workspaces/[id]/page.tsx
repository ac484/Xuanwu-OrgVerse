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
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Box,
  Layout,
  Activity,
  Users,
  AlertTriangle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { WorkspaceProvider, useWorkspace } from "./workspace-context";

/**
 * WorkspaceDetailPage - 職責：深度管理特定的邏輯空間
 * 已優化：引入 WorkspaceProvider 實現堆疊式功能擴展的共享上下文。
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
    addWorkspaceMember, 
    removeWorkspaceMember, 
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
  const localPulse = pulseLogs.filter(log => log.target.includes(workspace.name)).slice(0, 5);
  const assignedTeams = activeOrg?.teams?.filter(t => workspace?.teamIds?.includes(t.id)) || [];

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

  const getIcon = (type: string) => {
    switch (type) {
      case 'ui': return <Layout className="w-5 h-5" />;
      case 'api': return <Code className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-bold uppercase tracking-widest">邏輯空間 / {workspace.name}</span>
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
        description="管理此空間的原子能力堆疊與存取治理協議。"
        badge={
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-widest font-bold">
              ID: {workspace.id.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-[9px] uppercase font-bold flex items-center gap-1">
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
          <Button size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsSpecsOpen(true)}>
            <Zap className="w-3.5 h-3.5" /> 調整規格
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="capabilities" className="space-y-6">
            <TabsList className="bg-muted/40 p-1 border border-border/50">
              <TabsTrigger value="capabilities" className="text-[10px] font-bold uppercase tracking-widest px-6">能力堆疊</TabsTrigger>
              <TabsTrigger value="members" className="text-[10px] font-bold uppercase tracking-widest px-6">存取治理</TabsTrigger>
              <TabsTrigger value="specs" className="text-[10px] font-bold uppercase tracking-widest px-6">技術規格</TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/60 shadow-sm bg-card/30">
                  <CardHeader>
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-between text-primary">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" />
                        授權範疇 (Scope)
                      </div>
                    </CardTitle>
                    <CardDescription className="text-xs">定義此空間內原子能力的資源調用邊界。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {scope.map(s => (
                        <Badge key={s} variant="secondary" className="text-[9px] uppercase tracking-tighter py-0">{s}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm bg-card/30">
                  <CardHeader>
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-between text-primary">
                      <div className="flex items-center gap-2">
                        <Box className="w-3.5 h-3.5" />
                        存取協議 (Protocol)
                      </div>
                    </CardTitle>
                    <CardDescription className="text-xs">空間內所有能力的統一通訊與治理協議。</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                      <p className="text-xs font-mono">{protocol}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest">原子能力堆疊</h3>
                <Button size="sm" variant="outline" className="h-8 gap-2 font-bold text-[9px] uppercase tracking-widest" onClick={() => setIsAddCapOpen(true)}>
                  <Plus className="w-3 h-3" /> 註冊能力
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workspace.capabilities.map((cap) => (
                  <Card key={cap.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          {getIcon(cap.type)}
                        </div>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold">
                          {cap.status === 'stable' ? '穩定版' : '測試版'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-headline">{cap.name}</CardTitle>
                      <CardDescription className="text-[11px] mt-1">{cap.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="border-t border-border/10 flex justify-between items-center py-4 bg-muted/5">
                      <span className="text-[9px] font-mono text-muted-foreground">ID: {cap.id.toUpperCase()}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCapabilityFromWorkspace(workspace.id, cap.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> 共振團隊
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedTeams.map(team => (
                    <div key={team.id} className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Users className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs font-bold">{team.name}</p>
                          <p className="text-[9px] text-muted-foreground">{(team.memberIds || []).length} 名成員共振中</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2 bg-muted/20">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" /> 空間脈動
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {localPulse.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-muted/30 transition-colors">
                    <p className="text-[10px] font-bold leading-tight">
                      <span className="text-primary">{log.action}</span>
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground">{log.actor}</span>
                      <time className="text-[8px] text-muted-foreground/60">{format(log.timestamp, "HH:mm")}</time>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 彈窗組件 ... (省略部分與之前一致的 Dialog) */}
    </div>
  );
}
