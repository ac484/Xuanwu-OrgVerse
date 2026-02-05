"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Users, Zap, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

/**
 * SettingsPage - 職責：管理維度架構與安全策略
 * 已修正所有 "containers" 語義殘留。
 */
export default function SettingsPage() {
  const { organizations, activeOrgId } = useAppStore();
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  const handleSave = () => {
    toast({
      title: "核心邏輯已更新",
      description: "組織維度的架構參數已完成同步。",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">維度架構設定</h1>
        <p className="text-muted-foreground">管理 {activeOrg.name} 的根邏輯與主權邊界。</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Zap className="w-4 h-4 fill-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">維度核心</span>
            </div>
            <CardTitle className="font-headline">識別與上下文</CardTitle>
            <CardDescription>定義此組織維度的全域運行參數。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">顯示稱號 (Designation)</Label>
              <Input id="org-name" defaultValue={activeOrg.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-context">共鳴上下文 (Context)</Label>
              <Input id="org-context" defaultValue={activeOrg.context} />
              <p className="text-[10px] text-muted-foreground">影響 AI 對 UI 的適配深度與資源分配優先權。</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t">
            <Button onClick={handleSave} className="ml-auto font-bold uppercase text-xs tracking-widest">同步邏輯架構</Button>
          </CardFooter>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">安全治理層</span>
            </div>
            <CardTitle className="font-headline">主權協議 (Sovereignty)</CardTitle>
            <CardDescription>控制數據孤島的建立方式與跨界規則。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">物理級絕對隔離</Label>
                <p className="text-sm text-muted-foreground">強制所有邏輯空間 (Workspaces) 執行嚴格的層次化隔離。</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">跨維度資源授權</Label>
                <p className="text-sm text-muted-foreground">允許外部維度存取經授權的中心化 Hub 資源。</p>
              </div>
              <Switch defaultChecked={!activeOrg.isExternal} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">GenAI 環境共振適配</Label>
                <p className="text-sm text-muted-foreground">根據活動上下文自動調整全域 UI 共振風格。</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 border-2 bg-destructive/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">終極權限</span>
            </div>
            <CardTitle className="font-headline text-destructive">維度銷毀協議</CardTitle>
            <CardDescription className="text-destructive/80">不可逆地解體此組織維度及其轄下所有邏輯空間。</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-medium text-destructive mb-4">
              此操作需要「擁有者 (Owner)」級別的權限。一旦啟動，該架構內的所有邏輯定義將被永久抹除。
            </p>
            <Button variant="destructive" className="font-bold uppercase tracking-widest text-xs" disabled={activeOrg.role !== 'Owner'}>
              啟動解體程序
            </Button>
            {activeOrg.role !== 'Owner' && (
              <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> 當前權限不足以激活銷毀邏輯。身分：{activeOrg.role}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
