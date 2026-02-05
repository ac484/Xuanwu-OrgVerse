"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, User, Ghost, Lock, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInAnonymously,
  updateProfile
} from "firebase/auth";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * LoginPage - 職責：數位主權閘道器 (🐢 主題精簡版)
 * 優化：固定高度容器、組件化、零抖動切換、按鈕排列對齊。
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

  const handleAuth = async (type: 'login' | 'register') => {
    setIsLoading(true);
    try {
      if (type === 'login') {
        const { user: u } = await signInWithEmailAndPassword(auth, email, password);
        login({ id: u.uid, name: u.displayName || "實名用戶", email: u.email || "" });
      } else {
        if (!name) throw new Error("請輸入數位稱號");
        const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(u, { displayName: name });
        login({ id: u.uid, name, email });
      }
      toast({ title: "身分共振成功", description: "維度環境已激活。" });
      router.push("/dashboard");
    } catch (e: any) {
      toast({ variant: "destructive", title: "驗證失敗", description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      const { user: u } = await signInAnonymously(auth);
      login({ id: `anon-${u.uid.slice(0, 8)}`, name: "臨時訪客", email: "anonymous@orgverse.io" });
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // 內部高度對齊 Input 元件
  const InputField = ({ id, label, type = "text", icon: Icon, value, onChange, placeholder, extra }: any) => (
    <div className="space-y-2 h-[80px]">
      <div className="flex justify-between items-center px-1">
        <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</Label>
        {extra}
      </div>
      <div className="relative group">
        <Icon className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
        <Input 
          id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} 
          className="pl-11 h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20 font-medium transition-all" 
          required
        />
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background px-4 overflow-hidden">
      {/* 🐢 高性能背景粒子層 */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.04] animate-in fade-in duration-1000">
        <span className="absolute top-[10%] left-[10%] text-[15rem]">🐢</span>
        <span className="absolute bottom-[10%] right-[10%] text-[12rem]">🐢</span>
        <span className="absolute top-[40%] left-[25%] text-9xl -rotate-12">🐢</span>
        <span className="absolute bottom-[20%] left-[45%] text-8xl rotate-45">🐢</span>
      </div>
      
      <Card className="w-full max-w-md border-border/40 shadow-2xl bg-card/50 backdrop-blur-xl z-10 rounded-[3rem] overflow-hidden">
        <CardHeader className="pt-12 pb-6 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center relative group">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-500 block cursor-default select-none">🐢</span>
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-10" />
          </div>
        </CardHeader>

        <CardContent className="px-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30 mb-8 rounded-2xl h-12 p-1">
              <TabsTrigger value="login" className="text-[11px] uppercase font-black rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">登入</TabsTrigger>
              <TabsTrigger value="register" className="text-[11px] uppercase font-black rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">註冊</TabsTrigger>
            </TabsList>

            {/* 固定高度容器：防止切換時佈局跳動 */}
            <div className="h-[300px] flex flex-col"> 
              <TabsContent value="login" className="space-y-4 m-0 animate-in fade-in slide-in-from-left-2 duration-300 flex-1 flex flex-col">
                <InputField id="l-email" label="聯絡端點" type="email" icon={Mail} value={email} onChange={setEmail} placeholder="name@orgverse.io" />
                <InputField id="l-pass" label="安全密鑰" type="password" icon={Lock} value={password} onChange={setPassword} placeholder="••••••••" 
                  extra={<button onClick={() => setIsResetOpen(true)} className="text-[10px] font-black text-primary/60 hover:text-primary transition-colors uppercase">找回密鑰</button>} 
                />
                {/* 佈局佔位符：對齊註冊頁面的三欄位高度 */}
                <div className="h-[80px]" /> 
                <Button onClick={() => handleAuth('login')} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-base shadow-xl shadow-primary/20 mt-auto" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "進入維度"}
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 m-0 animate-in fade-in slide-in-from-right-2 duration-300 flex-1 flex flex-col">
                <InputField id="r-name" label="數位稱號" icon={User} value={name} onChange={setName} placeholder="例如: 守護者" />
                <InputField id="r-email" label="聯絡端點" type="email" icon={Mail} value={email} onChange={setEmail} placeholder="name@orgverse.io" />
                <InputField id="r-pass" label="設定密鑰" type="password" icon={Lock} value={password} onChange={setPassword} placeholder="至少 6 位字元" />
                <Button onClick={() => handleAuth('register')} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-base shadow-xl shadow-primary/20 mt-auto" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "註冊主權"}
                </Button>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-6 pt-10 pb-12 px-8 border-t border-border/10 bg-muted/5">
          <Button variant="ghost" className="w-full gap-3 text-muted-foreground hover:text-primary transition-all text-xs font-black uppercase py-7 rounded-2xl border border-dashed border-border/40 hover:border-primary/20" onClick={handleAnonymous} disabled={isLoading}>
            <Ghost className="w-4 h-4" /> 訪客存取 (受限主權)
          </Button>
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.2em] select-none">
            <span>登入即代表同意</span>
            <span className="flex items-center gap-1.5 text-muted-foreground/50"><span className="text-xs">🐢</span> 維度安全協議</span>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-sm">
          <DialogHeader><DialogTitle className="font-headline text-2xl flex items-center gap-3">🐢 重設密鑰</DialogTitle></DialogHeader>
          <div className="py-6">
            <InputField id="reset-email" label="電子信箱" type="email" icon={Mail} value={resetEmail} onChange={setResetEmail} placeholder="your@email.com" />
          </div>
          <DialogFooter className="sm:justify-center gap-3">
            <Button variant="ghost" onClick={() => setIsResetOpen(false)} className="rounded-xl font-black text-xs uppercase px-6">取消</Button>
            <Button onClick={async () => { await sendPasswordResetEmail(auth, resetEmail); setIsResetOpen(false); toast({title: "重置協議已發送"}); }} className="rounded-xl font-black text-xs uppercase px-8 shadow-lg shadow-primary/20">發送郵件</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
