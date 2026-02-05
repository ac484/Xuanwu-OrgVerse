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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="flex items-center gap-3 mb-10">
        <span className="text-4xl">🐢</span>
        <span className="text-2xl font-bold tracking-tight font-headline">OrgVerse</span>
      </div>
      
      <Card className="w-full max-w-md border-border/50 shadow-xl overflow-hidden bg-card/50 backdrop-blur-md">
        <div className="h-1.5 bg-primary" />
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/5 rounded-full border border-primary/10">
              <span className="text-5xl">🐢</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-headline">數位主權閘道器</CardTitle>
          <CardDescription>
            驗證數位身分以建立邏輯存在。
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 mb-6">
              <TabsTrigger value="login" className="text-xs uppercase font-bold">登入</TabsTrigger>
              <TabsTrigger value="register" className="text-xs uppercase font-bold">註冊</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">電子信箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="login-email" 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="name@orgverse.io"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="login-password">安全權杖 (密碼)</Label>
                    <button 
                      type="button"
                      onClick={() => setIsResetOpen(true)}
                      className="text-[10px] uppercase font-bold text-primary hover:underline"
                    >
                      忘記密碼?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button className="w-full font-bold uppercase tracking-widest h-11" disabled={isLoading}>
                  {isLoading ? "驗證中..." : "建立身分共振"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">數位稱號</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="reg-name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="例如: 亞特蘭提斯首席"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">聯絡端點 (Email)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="reg-email" 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="name@orgverse.io"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">安全密鑰</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="reg-password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="至少 6 位字元"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button className="w-full font-bold uppercase tracking-widest h-11" disabled={isLoading}>
                  {isLoading ? "初始化中..." : "註冊數位身分"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-border/40 pt-6 bg-muted/10">
          <Button 
            variant="ghost" 
            className="w-full gap-2 text-muted-foreground hover:text-primary transition-all text-xs font-bold uppercase tracking-tighter"
            onClick={handleAnonymousLogin}
            disabled={isLoading}
          >
            <Ghost className="w-4 h-4" /> 訪客模式 (受限存取)
          </Button>
          
          <p className="text-[10px] text-center text-muted-foreground/60 leading-tight">
            登入即表示您同意激活跨維度的權限授權與隱私條款。
          </p>
        </CardFooter>
      </Card>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">重設安全權杖</DialogTitle>
            <DialogDescription>
              輸入您的聯絡端點 (Email)，我們將發送重設指令。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">電子信箱</Label>
              <Input 
                id="reset-email" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                placeholder="your@email.com" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetOpen(false)}>取消</Button>
            <Button onClick={handleResetPassword}>發送重設郵件</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
