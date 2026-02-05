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
  Shield, 
  Terminal,
  Globe,
  Database,
  Code,
  Layers,
  Info,
  Plus,
  Users,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Box,
  Layout
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const { workspaces, addCapabilityToWorkspace, addWorkspaceMember, removeWorkspaceMember, removeCapabilityFromWorkspace } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const workspace = workspaces.find(w => w.id === id);

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Terminal className="w-16 h-16 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-bold font-headline">空間連結失效</h2>
        <Button onClick={() => router.push('/dashboard/workspaces')}>返回空間列表</Button>
      </div>
    );
  }

  const capabilities = workspace.capabilities || [];
  const members = workspace.members || [];
  const boundary = workspace.boundary || [];

  const handleQuickAddCapability = () => {
    addCapabilityToWorkspace(workspace.id, {
      name: `原子能力-${Math.floor(Math.random() * 1000)}`,
      type: "ui",
      status: "beta",
      description: "於此空間子單元內定義的技術規格單元。"
    });
    toast({
      title: "原子能力已掛載",
      description: "新的技術規格已添加至此空間的專屬註冊表中。",
    });
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
    <div className="space-y-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-bold uppercase tracking-widest">邏輯空間 / {workspace.name}</span>
      </div>

      <PageHeader 
        title={workspace.name} 
        description="管理此空間的原子能力規格與存取治理協議。"
        badge={
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-widest font-bold">
              ID: {workspace.id.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-[9px] uppercase font-bold flex items-center gap-1">
              {workspace.visibility === 'visible' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {workspace.visibility === 'visible' ? '可見' : '受限'}
            </Badge>
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest">
            <Settings className="w-3.5 h-3.5" /> 空間設定
          </Button>
          <Button size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest" onClick={() => toast({ title: "同步成功", description: "維度共振已重新校準。" })}>
            <Zap className="w-3.5 h-3.5" /> 刷新共鳴
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="capabilities" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/50">
          <TabsTrigger value="capabilities" className="text-[10px] font-bold uppercase tracking-widest px-6">原子能力</TabsTrigger>
          <TabsTrigger value="members" className="text-[10px] font-bold uppercase tracking-widest px-6">人員存取權</TabsTrigger>
          <TabsTrigger value="specs" className="text-[10px] font-bold uppercase tracking-widest px-6">空間規格</TabsTrigger>
        </TabsList>

        <TabsContent value="specs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 shadow-sm bg-card/30">
              <CardHeader>
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Globe className="w-3.5 h-3.5" />
                  資源邊界 (Boundary)
                </CardTitle>
                <CardDescription className="text-xs">定義此空間子單元的邏輯邊界與資源範疇。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-2">已授權範圍</p>
                  <div className="flex flex-wrap gap-1.5">
                    {boundary.map(s => (
                      <Badge key={s} variant="secondary" className="text-[9px] uppercase tracking-tighter py-0">{s}</Badge>
                    ))}
                    {boundary.length === 0 && <span className="text-[10px] text-muted-foreground italic">未定義資源邊界。</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm bg-card/30">
              <CardHeader>
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Box className="w-3.5 h-3.5" />
                  存取協議 (Protocol)
                </CardTitle>
                <CardDescription className="text-xs">定義空間內的數據解析路徑與治理協議。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">協議類別</p>
                  <p className="text-xs font-mono">{workspace.protocol || '標準存取協議'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest">空間能力目錄</h3>
            <Button size="sm" variant="outline" className="h-8 gap-2 font-bold text-[9px] uppercase tracking-widest" onClick={() => router.push(`/dashboard/workspaces/capabilities`)}>
              <Plus className="w-3 h-3" /> 註冊原子能力
            </Button>
          </div>

          {capabilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((cap) => (
                <Card key={cap.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        {getIcon(cap.type)}
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold bg-background/50">
                        {cap.status === 'stable' ? '穩定版' : '測試版'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-headline">{cap.name}</CardTitle>
                    <CardDescription className="text-[11px] mt-1">{cap.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t border-border/10 flex justify-between items-center py-4 bg-muted/5">
                    <span className="text-[9px] font-mono text-muted-foreground">ID: {cap.id.toUpperCase()}</span>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCapabilityFromWorkspace(workspace.id, cap.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
              <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
              <h3 className="text-xl font-bold font-headline">能力目錄為空</h3>
              <p className="text-sm text-muted-foreground mb-8">此空間目前尚未掛載任何原子能力規範。</p>
              <Button onClick={handleQuickAddCapability} className="font-bold text-[10px] uppercase tracking-widest h-10 px-6">
                定義首個能力
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest">空間存取名單</h3>
            <Button size="sm" variant="outline" className="h-8 gap-2 font-bold text-[9px] uppercase tracking-widest" onClick={() => addWorkspaceMember(workspace.id, { name: "新操作員", email: "operator@orgverse.io", role: "Member" })}>
              <UserPlus className="w-3 h-3" /> 分配成員
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card key={member.id} className="border-border/60 bg-card/40 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary text-xs font-bold">
                      {member.name?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[8px] uppercase tracking-tighter bg-background">
                      {member.role}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeWorkspaceMember(workspace.id, member.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
