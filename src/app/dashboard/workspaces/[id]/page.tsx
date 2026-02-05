
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
  Plus,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const { workspaces, updateWorkspace, addCapabilityToWorkspace, addWorkspaceMember, removeWorkspaceMember, removeCapabilityFromWorkspace } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isAddCapOpen, setIsAddCapOpen] = useState(false);
  const router = useRouter();

  const workspace = workspaces.find(w => w.id === id);
  
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

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Terminal className="w-16 h-16 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-bold font-headline">空間連結失效</h2>
        <Button onClick={() => router.push('/dashboard/workspaces')}>返回空間列表</Button>
      </div>
    );
  }

  const handleUpdateSettings = () => {
    updateWorkspace(workspace.id, {
      name: editName,
      visibility: editVisibility
    });
    setIsSettingsOpen(false);
    toast({ title: "空間規格已同步", description: "新的治理解析路徑已生效。" });
  };

  const handleUpdateSpecs = () => {
    updateWorkspace(workspace.id, {
      protocol: editProtocol,
      scope: editScope.split(",").map(s => s.trim()).filter(Boolean)
    });
    setIsSpecsOpen(false);
    toast({ title: "技術邊界已重定義", description: "授權範疇與協議規格已即時更新。" });
  };

  const handleAddCapability = (capType: 'ui' | 'api' | 'data') => {
    const caps = {
      ui: { name: '新 UI 單元', description: '自定義的原子化視覺組件規格。' },
      api: { name: '新 API 接口', description: '標準化的數據交換與邏輯單元。' },
      data: { name: '新數據帳本', description: '具備主權追蹤能力的持久化層。' }
    };
    
    addCapabilityToWorkspace(workspace.id, {
      ...caps[capType],
      type: capType,
      status: "beta"
    });
    setIsAddCapOpen(false);
    toast({ title: "原子能力已掛載", description: "新的技術規格已併入空間環境。" });
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
              {workspace.visibility === 'visible' ? '可見' : '隱藏'}
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
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-between text-primary">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    授權範疇 (Scope)
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-[8px] uppercase tracking-widest" onClick={() => setIsSpecsOpen(true)}>編輯</Button>
                </CardTitle>
                <CardDescription className="text-xs">定義此空間子單元的邏輯邊界與資源範疇。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {(workspace.scope || []).map(s => (
                    <Badge key={s} variant="secondary" className="text-[9px] uppercase tracking-tighter py-0">{s}</Badge>
                  ))}
                  {(!workspace.scope || workspace.scope.length === 0) && <span className="text-[10px] text-muted-foreground italic">未定義範疇。</span>}
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
                  <Button variant="ghost" size="sm" className="h-6 text-[8px] uppercase tracking-widest" onClick={() => setIsSpecsOpen(true)}>編輯</Button>
                </CardTitle>
                <CardDescription className="text-xs">定義空間內的數據解析路徑與治理協議。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                  <p className="text-xs font-mono">{workspace.protocol || '標準存取協議'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest">空間能力目錄</h3>
            <Button size="sm" variant="outline" className="h-8 gap-2 font-bold text-[9px] uppercase tracking-widest" onClick={() => setIsAddCapOpen(true)}>
              <Plus className="w-3 h-3" /> 註冊原子能力
            </Button>
          </div>

          {(workspace.capabilities || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspace.capabilities.map((cap) => (
                <Card key={cap.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCapabilityFromWorkspace(workspace.id, cap.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
              <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
              <h3 className="text-xl font-bold font-headline">能力目錄為空</h3>
              <p className="text-sm text-muted-foreground mb-8">此空間目前尚未掛載任何原子能力規範。</p>
              <Button onClick={() => setIsAddCapOpen(true)} className="font-bold text-[10px] uppercase tracking-widest h-10 px-6">
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
            {(workspace.members || []).map((member) => (
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

      {/* 空間設定彈窗 */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">空間規格校準</DialogTitle>
            <DialogDescription>修改此邏輯空間的識別名稱與維度可見性策略。</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>空間名稱</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/60">
              <div className="space-y-0.5">
                <Label className="text-base">維度可見性</Label>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                  {editVisibility === 'visible' ? '已掛載於維度目錄' : '處於受限隔離模式'}
                </p>
              </div>
              <Switch checked={editVisibility === 'visible'} onCheckedChange={(checked) => setEditVisibility(checked ? 'visible' : 'hidden')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>取消</Button>
            <Button onClick={handleUpdateSettings}>確認更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 空間規格編輯彈窗 */}
      <Dialog open={isSpecsOpen} onOpenChange={setIsSpecsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">定義技術邊界</DialogTitle>
            <DialogDescription>調整空間的授權範疇與底層存取協議規格。</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>存取協議 (Protocol)</Label>
              <Select value={editProtocol} onValueChange={setEditProtocol}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇協議" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="標準存取協議">標準存取協議</SelectItem>
                  <SelectItem value="零信任安全協議">零信任安全協議</SelectItem>
                  <SelectItem value="高頻數據解析協議">高頻數據解析協議</SelectItem>
                  <SelectItem value="隔離沙盒協議">隔離沙盒協議</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>授權範疇 (Scope)</Label>
              <Input value={editScope} onChange={(e) => setEditScope(e.target.value)} placeholder="以逗號分隔，例如: 運算, 儲存, 驗證" />
              <p className="text-[10px] text-muted-foreground italic">定義此空間內可被調用的資源邊界關鍵字。</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpecsOpen(false)}>取消</Button>
            <Button onClick={handleUpdateSpecs}>確認建立</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 原子能力掛載彈窗 */}
      <Dialog open={isAddCapOpen} onOpenChange={setIsAddCapOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">掛載原子能力</DialogTitle>
            <DialogDescription>選取要註冊到此邏輯空間的技術單元規格。</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
             <button className="flex items-center gap-4 p-4 border rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all text-left group" onClick={() => handleAddCapability('ui')}>
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Layout className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold">身分驗證 UI 單元</p>
                  <p className="text-[10px] text-muted-foreground">視覺化的身分共振與登入介面組件。</p>
                </div>
             </button>
             <button className="flex items-center gap-4 p-4 border rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all text-left group" onClick={() => handleAddCapability('api')}>
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Code className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold">數據交換接口</p>
                  <p className="text-[10px] text-muted-foreground">標準化的跨維度數據存取 API。</p>
                </div>
             </button>
             <button className="flex items-center gap-4 p-4 border rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all text-left group" onClick={() => handleAddCapability('data')}>
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Database className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold">主權審計帳本</p>
                  <p className="text-[10px] text-muted-foreground">不可篡改的變動追蹤與持久化單元。</p>
                </div>
             </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
