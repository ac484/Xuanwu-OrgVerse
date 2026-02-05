"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Settings, Zap, Shield, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

/**
 * OrganizationSettingsPage - 職責：管理維度（組織）的核心架構參數
 */
export default function OrganizationSettingsPage() {
  const { organizations, activeOrgId, updateOrganization, updateOrgTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);
  
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  
  const [name, setName] = useState(activeOrg?.name || "");
  const [context, setContext] = useState(activeOrg?.context || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeOrg) {
      setName(activeOrg.name);
      setContext(activeOrg.context);
    }
  }, [activeOrg]);

  if (!mounted || !activeOrg) return null;

  const handleSave = () => {
    updateOrganization(activeOrg.id, { name, context });
    toast({
      title: "維度架構已更新",
      description: "組織核心參數已同步至所有相關邏輯空間。",
    });
  };

  const handleRecalibrate = () => {
    updateOrgTheme(activeOrg.id, undefined); // 清除主題，觸發 UIAdapter 重新適配
    toast({
      title: "色彩共振校準中",
      description: "正在根據新的架構上下文重新計算維度色彩。",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <PageHeader 
        title="維度設定" 
        description="管理當前組織維度的核心身分、架構描述與治理策略。"
      />

      <div className="grid gap-6">
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">維度主權</span>
            </div>
            <CardTitle className="font-headline">基本架構資訊</CardTitle>
            <CardDescription>定義此組織維度在全球架構中的識別方式。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">維度名稱</Label>
              <Input 
                id="org-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="例如: 全球技術研發維度"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-context">架構上下文 (Architectural Context)</Label>
              <Textarea 
                id="org-context" 
                value={context} 
                onChange={(e) => setContext(e.target.value)}
                placeholder="描述此組織的業務背景、技術棧或文化特質..."
                className="min-h-[100px]"
              />
              <p className="text-[10px] text-muted-foreground italic">
                AI 將根據此描述自動適配 UI 色彩與空間預設策略。
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t flex justify-between items-center py-4">
            <Button variant="outline" size="sm" className="gap-2 font-bold uppercase text-[10px] tracking-widest" onClick={handleRecalibrate}>
              <Zap className="w-3.5 h-3.5" /> 重新校準色彩
            </Button>
            <Button onClick={handleSave} className="font-bold uppercase text-[10px] tracking-widest">
              儲存架構變動
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive/30 border-2 bg-destructive/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">終極指令</span>
            </div>
            <CardTitle className="font-headline text-destructive">維度銷毀協議</CardTitle>
            <CardDescription className="text-destructive/80">
              永久移除此組織維度及其下屬的所有邏輯空間與成員權限。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-medium text-destructive mb-4">
              此操作不可逆。執行後，所有與此維度相關的技術規格與身分共振將永久消失。
            </p>
            <Button variant="destructive" className="font-bold uppercase tracking-widest text-[10px]">
              啟動銷毀程序
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
