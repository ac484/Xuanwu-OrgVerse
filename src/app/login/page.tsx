"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, User, Ghost, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInAnonymously,
  updateProfile
} from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * LoginPage - 職責：整合 Firebase Authentication 的數位主權入口
 * 視覺主題：極簡高性能 🐢 主題環境
 */
export default function LoginPage() {
  const { auth } = useFirebase();
  const { login } = useAppStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      login({ 
        id: firebaseUser.uid, 
        name: firebaseUser.displayName || "實名用戶", 
        email: firebaseUser.email || "" 
      });
      
      toast({ title: "身分驗證成功", description: "維度環境已激活。" });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "驗證失敗", 
        description: error.message || "請檢查信箱與密碼。" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({ variant: "destructive", title: "註冊失敗", description: "請輸入您的數位稱號。" });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      login({ 
        id: userCredential.user.uid, 
        name: name, 
        email: email 
      });
      
      toast({ title: "維度身分已建立", description: "歡迎加入 OrgVerse。" });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "註冊失敗", 
        description: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      login({ 
        id: `anon-${userCredential.user.uid.slice(0, 8)}`, 
        name: "臨時訪客", 
        email: "anonymous@orgverse.io" 
      });
      toast({ 
        title: "受限存取激活", 
        description: "您目前以匿名身分進入，部分維度主權將受限。" 
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "匿名登入失敗", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return;
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "密碼重設郵件已發送", description: "請檢查您的電子信箱。" });
      setIsResetOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "發送失敗", description: error.message });
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background px-4 overflow-hidden">
      {/* 🐢 高性能背景主題層 - 使用極低透明度減少視覺干擾 */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.03]">
        <span className="absolute top-10 left-10 text-[12rem]">🐢</span>
        <span className="absolute bottom-20 right-20 text-[10rem]">🐢</span>
        <span className="absolute top-1/2 left-1/4 text-8xl -rotate-12">🐢</span>
        <span className="absolute top-1/3 right-1/3 text-9xl rotate-12">🐢</span>
        <span className="absolute bottom-1/4 left-1/2 text-7xl -rotate-45">🐢</span>
      </div>
      
      <Card className="w-full max-w-md border-border/50 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-md z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="h-1 bg-primary" />
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative p-5 bg-primary/5 rounded-full border border-primary/10 group">
              <span className="text-6xl group-hover:scale-110 transition-transform duration-500 block">🐢</span>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-10" />
            </div>
          </div>
          <CardTitle className="text-xl font-headline tracking-tight uppercase">數位主權閘道器</CardTitle>
          <CardDescription className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-50">
            身分共振 · 穩健守護
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 mb-6 rounded-xl h-10 p-1">
              <TabsTrigger value="login" className="text-[10px] uppercase font-black rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">登入</TabsTrigger>
              <TabsTrigger value="register" className="text-[10px] uppercase font-black rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">註冊</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-in fade-in duration-300">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-[9px] font-black uppercase tracking-widest ml-1 text-muted-foreground">聯絡端點 (Email)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                    <Input 
                      id="login-email" 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="name@orgverse.io"
                      className="pl-10 h-11 rounded-xl bg-muted/20 border-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="login-password" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">安全密鑰</Label>
                    <button 
                      type="button"
                      onClick={() => setIsResetOpen(true)}
                      className="text-[9px] uppercase font-black text-primary/60 hover:text-primary transition-colors"
                    >
                      找回密鑰
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="pl-10 h-11 rounded-xl bg-muted/20 border-none"
                      required
                    />
                  </div>
                </div>
                <Button className="w-full font-black uppercase tracking-[0.2em] h-12 rounded-xl shadow-lg shadow-primary/10 mt-2 text-xs" disabled={isLoading}>
                  {isLoading ? "正在驗證..." : "進入維度"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="animate-in fade-in duration-300">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-[9px] font-black uppercase tracking-widest ml-1 text-muted-foreground">數位稱號</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                    <Input 
                      id="reg-name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="例如: 守護者"
                      className="pl-10 h-11 rounded-xl bg-muted/20 border-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-[9px] font-black uppercase tracking-widest ml-1 text-muted-foreground">聯絡端點 (Email)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                    <Input 
                      id="reg-email" 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="name@orgverse.io"
                      className="pl-10 h-11 rounded-xl bg-muted/20 border-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-[9px] font-black uppercase tracking-widest ml-1 text-muted-foreground">設定密鑰</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                    <Input 
                      id="reg-password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="至少 6 位字元"
                      className="pl-10 h-11 rounded-xl bg-muted/20 border-none"
                      required
                    />
                  </div>
                </div>
                <Button className="w-full font-black uppercase tracking-[0.2em] h-12 rounded-xl shadow-lg shadow-primary/10 mt-2 text-xs" disabled={isLoading}>
                  {isLoading ? "建立中..." : "註冊主權"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-border/20 pt-6 bg-muted/10">
          <Button 
            variant="ghost" 
            className="w-full gap-2 text-muted-foreground hover:text-primary transition-all text-[10px] font-black uppercase tracking-tighter"
            onClick={handleAnonymousLogin}
            disabled={isLoading}
          >
            <Ghost className="w-3.5 h-3.5" /> 訪客存取 (受限主權)
          </Button>
          
          <p className="text-[8px] text-center text-muted-foreground/40 leading-tight uppercase font-bold tracking-widest">
            登入即代表同意 🐢 維度安全協議
          </p>
        </CardFooter>
      </Card>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-lg flex items-center gap-2">
              <span className="text-2xl">🐢</span> 重設安全密鑰
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-widest opacity-60">
              請輸入您的聯絡端點
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-[9px] font-black uppercase tracking-widest ml-1">電子信箱</Label>
              <Input 
                id="reset-email" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                placeholder="your@email.com" 
                className="h-11 rounded-xl bg-muted/30 border-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetOpen(false)} className="rounded-xl font-black uppercase text-[10px]">取消</Button>
            <Button onClick={handleResetPassword} className="rounded-xl font-black uppercase text-[10px] shadow-lg shadow-primary/10">發送郵件</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
