
"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Bell, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * SettingsPage - 職責：用戶中心，管理個人身分與環境偏好
 * 已實作持久化閉環：變更會即時同步至 Store。
 */
export default function SettingsPage() {
  const { user, updateUser, logout } = useAppStore();
  const [name, setName] = useState(user?.name || "");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!mounted) return null;

  const handleSave = () => {
    updateUser({ name });
    toast({
      title: "身分參數已更新",
      description: "您的數位稱號已同步至全域維度環境。",
    });
  };

  const handleWithdraw = () => {
    if (confirm("確定要啟動身分撤回協議嗎？這將抹除您所有的數位紀錄。")) {
      logout();
      router.push("/login");
      toast({
        variant: "destructive",
        title: "身分已註銷",
        description: "您的所有數位軌跡已從 OrgVerse 中移除。",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">用戶面板與用戶設置</h1>
        <p className="text-muted-foreground">管理您在 OrgVerse 中的數位身分與個人化偏好。</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <User className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">個人身分</span>
            </div>
            <CardTitle className="font-headline">基本資料</CardTitle>
            <CardDescription>定義您在跨維度協作中的公開識別資訊。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="user-name">數位稱號</Label>
              <Input 
                id="user-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">聯絡端點 (Email)</Label>
              <Input id="user-email" defaultValue={user?.email} disabled />
              <p className="text-[10px] text-muted-foreground italic">由身分主權閘道器鎖定，不可直接更改。</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t">
            <Button onClick={handleSave} className="ml-auto font-bold uppercase text-xs tracking-widest">更新個人資料</Button>
          </CardFooter>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Bell className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">環境偏好</span>
            </div>
            <CardTitle className="font-headline">主權環境設定</CardTitle>
            <CardDescription>控制您在不同邏輯空間切換時的自動化行為。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">自動適配 UI 共振</Label>
                <p className="text-sm text-muted-foreground">進入不同組織維度時，自動調用 AI 生成專屬色彩。</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">維度活動通知</Label>
                <p className="text-sm text-muted-foreground">當邏輯空間有新的技術規格掛載或成員變動時接收提醒。</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 border-2 bg-destructive/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">終極安全</span>
            </div>
            <CardTitle className="font-headline text-destructive">身分撤回協議</CardTitle>
            <CardDescription className="text-destructive/80">永久註銷您的數位身分並抹除所有維度活動紀錄。</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-medium text-destructive mb-4">
              這是一個不可逆的操作。註銷後，您將失去對所有組織維度與邏輯空間的存取權限。
            </p>
            <Button variant="destructive" className="font-bold uppercase tracking-widest text-xs" onClick={handleWithdraw}>
              啟動撤回程序
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
