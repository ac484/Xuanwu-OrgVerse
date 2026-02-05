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
  Plus
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

/**
 * WorkspaceDetailPage
 * 職責：作為邏輯空間的主機，管理其「基礎設施定義」與「專屬能力註冊表」。
 */
export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const { workspaces, addSpecToWorkspace } = useAppStore();
  const router = useRouter();

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

  const handleQuickAddSpec = () => {
    addSpecToWorkspace(workspace.id, {
      name: "新原子能力規格",
      type: "api",
      status: "beta",
      description: "手動於此空間定義的技術規範單元。"
    });
    toast({
      title: "規格已註冊",
      description: "新的技術規範已添加至此空間的註冊表中。"
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
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
        <span className="text-xs font-bold uppercase tracking-widest">邏輯架構 / {workspace.name}</span>
      </div>

      <PageHeader 
        title={workspace.name} 
        description={`技術環境定義: ${workspace.context}`}
        badge={
          <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-widest font-bold">
            ID: {workspace.id.toUpperCase()}
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest">
            <Settings className="w-3.5 h-3.5" /> 策略設定
          </Button>
          <Button size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest" onClick={() => toast({ title: "同步成功", description: "維度共振已重新校準。" })}>
            <Zap className="w-3.5 h-3.5" /> 刷新共鳴
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="infra" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/50">
          <TabsTrigger value="infra" className="text-[10px] font-bold uppercase tracking-widest px-6">基礎設施定義</TabsTrigger>
          <TabsTrigger value="specs" className="text-[10px] font-bold uppercase tracking-widest px-6">專屬原子能力 (Specs)</TabsTrigger>
        </TabsList>

        <TabsContent value="infra" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 shadow-sm bg-card/30">
              <CardHeader>
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Globe className="w-3.5 h-3.5" />
                  內容範圍 (Contextual Scope)
                </CardTitle>
                <CardDescription className="text-xs">定義邏輯邊界與運行時上下文。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">運行標識符</p>
                  <code className="text-xs text-primary font-mono">{workspace.context}</code>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-2">資源邊界</p>
                  <div className="flex flex-wrap gap-1.5">
                    {workspace.scope.map(s => (
                      <Badge key={s} variant="secondary" className="text-[9px] uppercase tracking-tighter py-0">{s}</Badge>
                    ))}
                    {workspace.scope.length === 0 && <span className="text-[10px] text-muted-foreground italic">未定義資源範圍。</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm bg-card/30">
              <CardHeader>
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Database className="w-3.5 h-3.5" />
                  數據解析 (Data Resolution)
                </CardTitle>
                <CardDescription className="text-xs">定義隔離治理與解析路徑。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">解析協議 (Resolver)</p>
                  <p className="text-xs font-mono">{workspace.resolver}</p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-[9px] text-primary uppercase font-bold mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> 當前安全策略
                  </p>
                  <p className="text-xs font-semibold">{workspace.policy}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest">空間規格目錄</h3>
            <Button size="sm" variant="outline" className="h-8 gap-2 font-bold text-[9px] uppercase tracking-widest" onClick={handleQuickAddSpec}>
              <Plus className="w-3 h-3" /> 註冊技術規範
            </Button>
          </div>

          {workspace.specs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspace.specs.map((block) => (
                <Card key={block.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        {getIcon(block.type)}
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-[0.1em] font-bold bg-background/50">
                        {block.status === 'stable' ? 'PRODUCTION' : 'BETA'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">{block.name}</CardTitle>
                    <CardDescription className="text-[11px] leading-relaxed mt-1">{block.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-4 border-t border-border/10 flex justify-between items-center bg-muted/5 py-4 px-6">
                    <span className="text-[9px] font-mono text-muted-foreground/60">ID: {block.id.slice(-6).toUpperCase()}</span>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-[0.1em] text-primary hover:bg-primary/5">
                      <Info className="w-3.5 h-3.5" /> FACADE 規格
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
              <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
              <h3 className="text-xl font-bold font-headline">規格目錄為空</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">
                此空間目前尚未註冊任何原子能力規範。您可以定義符合此空間 Context 與 Policy 的技術規格。
              </p>
              <Button onClick={handleQuickAddSpec} className="font-bold text-[10px] uppercase tracking-widest h-10 px-6">
                定義首個規格
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
