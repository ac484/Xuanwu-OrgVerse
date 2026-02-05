"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Zap, Shield, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase/provider";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

/**
 * OrganizationSettingsPage - 職責：管理當前維度的核心身分識別
 * 已校準跳轉路徑至單數 organization。
 */
export default function OrganizationSettingsPage() {
  const { organizations, activeOrgId } = useAppStore();
  const { db } = useFirebase();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  
  const [name, setName] = useState(activeOrg?.name || "");
  const [description, setDescription] = useState(activeOrg?.description || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeOrg) {
      setName(activeOrg.name);
      setDescription(activeOrg.description);
    }
  }, [activeOrg]);

  if (!mounted || !activeOrg) return null;

  const handleSave = () => {
    const orgRef = doc(db, "organizations", activeOrg.id);
    const updates = { name, description };
    
    updateDoc(orgRef, updates)
      .then(() => {
        toast({ title: "維度主權更新成功", description: "維度識別參數已同步至全域環境。" });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: orgRef.path,
          operation: 'update',
          requestResourceData: updates
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  };

  const handleRecalibrate = () => {
    const orgRef = doc(db, "organizations", activeOrg.id);
    updateDoc(orgRef, { theme: null })
      .then(() => {
        toast({ title: "色彩共振校準中", description: "正在重新計算 UI 色彩。" });
      });
  };

  const handleDelete = () => {
    if (activeOrg.id === 'personal') {
      toast({ variant: "destructive", title: "禁止銷毀", description: "個人基礎維度不可被銷毀。" });
      return;
    }

    if (confirm(`確定要銷毀維度「${activeOrg.name}」嗎？`)) {
      const orgRef = doc(db, "organizations", activeOrg.id);
      deleteDoc(orgRef)
        .then(() => {
          router.push("/dashboard");
          toast({ title: "維度已銷毀" });
        })
        .catch(async () => {
          const error = new FirestorePermissionError({
            path: orgRef.path,
            operation: 'delete'
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', error);
        });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <PageHeader 
        title="維度設定" 
        description="管理當前維度的核心身分識別、識別描述與治理策略。"
      />

      <div className="grid gap-6">
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">維度識別管理</span>
            </div>
            <CardTitle className="font-headline">基礎識別資訊</CardTitle>
            <CardDescription>定義此維度的全球識別名稱與核心特質描述。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">維度名稱</Label>
              <Input 
                id="org-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="例如: 核心研發維度"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-desc">維度識別描述</Label>
              <Textarea 
                id="org-desc" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述此維度的業務背景..."
                className="min-h-[100px]"
              />
              <p className="text-[10px] text-muted-foreground italic">
                AI 將根據此描述自動計算專屬的 UI 色彩方案。
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t flex justify-between items-center py-4">
            <button className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] tracking-widest hover:opacity-80 transition-opacity" onClick={handleRecalibrate}>
              <Zap className="w-3.5 h-3.5" /> 重新校準 UI 色彩
            </button>
            <Button onClick={handleSave} className="font-bold uppercase text-[10px] tracking-widest">
              儲存變動
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive/30 border-2 bg-destructive/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">極端安全指令</span>
            </div>
            <CardTitle className="font-headline text-destructive">維度銷毀協議</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="font-bold uppercase tracking-widest text-[10px]" onClick={handleDelete}>
              啟動銷毀程序
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
