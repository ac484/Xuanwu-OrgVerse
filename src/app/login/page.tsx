"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, User, Ghost, Lock, Loader2 } from "lucide-react";
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
 * LoginPage - 職責：數位主權閘道器。
 * 特色：🐢 主題化、固定高度佈局、極致效能切換。
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

  // 高效能輸入組件
  const InputField = ({ id, label, type = "text", icon: Icon, value, onChange, placeholder, extra }: any) => (
    <div className="space-y-1.5 h-[72px]">
      <div className="flex justify-between items-center px-1">
        <Label htmlFor={id} className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
        {extra}
      </div>
      <div className="relative group">
        <Icon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
        <Input 
          id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className="pl-10 h-11 rounded-xl bg-muted/20 border-none transition-all focus-visible:ring-1 focus-visible:ring-primary/20" required
        />
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background px-4 overflow-hidden">
      {/* 🐢 高性能背景層 */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.03] animate-in fade-in duration-1000">
        <span className="absolute top-10 left-10 text-[12rem]">🐢</span>
        <span className="absolute bottom-20 right-20 text-[10rem]">🐢</span>
        <span className="absolute top-1/2 left-1/4 text-8xl -rotate-12">🐢</span>
        <span className="absolute bottom-1/4 left-1/2 text-7xl -rotate-45">🐢</span>
      </div>
      
      <Card className="w-full max-w-md border-border/50 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-md z-10">
        <div className="h-1 bg-primary w-full" />
        <CardHeader className="pb-4 pt-8 text-center">
          <div className="flex justify-center">
            <div className="relative p-5 bg-primary/5 rounded-full border border-primary/10 group">
              <span className="text-6xl group-hover:scale-110 transition-transform duration-500 block cursor-default">🐢</span>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-10" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 mb-8 rounded-xl h-10 p-1">
              <TabsTrigger value="login" className="text-[10px] uppercase font-black rounded-lg transition-all">登入</TabsTrigger>
              <TabsTrigger value="register" className="text-[10px] uppercase font-black rounded-lg transition-all">註冊</TabsTrigger>
            </TabsList>

            {/* 核心優化：固定高度容器，防止抖動與重疊 */}
            <div className="h-[280px]"> 
              <TabsContent value="login" className="space-y-4 m-0 animate-in fade-in duration-300 h-full flex flex-col">
                <InputField id="l-email" label="聯絡端點" type="email" icon={Mail} value={email} onChange={setEmail} placeholder="name@orgverse.io" />
                <InputField id="l-pass" label="安全密鑰" type="password" icon={Lock} value={password} onChange={setPassword} placeholder="••••••••" 
                  extra={<button onClick={() => setIsResetOpen(true)} className="text-[9px] font-black text-primary/60 hover:text-primary transition-colors uppercase">找回密鑰</button>} 
                />
                {/* 佈局佔位符：對齊註冊頁面的三個欄位空間 */}
                <div className="h-[72px]" /> 
                <div className="mt-auto">
                  <Button onClick={() => handleAuth('login')} className="w-full font-black uppercase tracking-widest h-12 rounded-xl" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "進入維度"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 m-0 animate-in fade-in duration-300 h-full flex flex-col">
                <InputField id="r-name" label="數位稱號" icon={User} value={name} onChange={setName} placeholder="例如: 守護者" />
                <InputField id="r-email" label="聯絡端點" type="email" icon={Mail} value={email} onChange={setEmail} placeholder="name@orgverse.io" />
                <InputField id="r-pass" label="設定密鑰" type="password" icon={Lock} value={password} onChange={setPassword} placeholder="至少 6 位字元" />
                <div className="mt-auto">
                  <Button onClick={() => handleAuth('register')} className="w-full font-black uppercase tracking-widest h-12 rounded-xl" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "註冊主權"}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-border/20 pt-6 pb-8 bg-muted/10">
          <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-primary transition-all text-[10px] font-black uppercase" onClick={handleAnonymous} disabled={isLoading}>
            <Ghost className="w-3.5 h-3.5" /> 訪客存取 (受限主權)
          </Button>
          <p className="text-[8px] text-center text-muted-foreground/40 leading-tight uppercase font-bold tracking-widest">登入即代表同意 🐢 維度安全協議</p>
        </CardFooter>
      </Card>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="rounded-2xl border-none shadow-2xl">
          <DialogHeader><DialogTitle className="font-headline flex items-center gap-2">🐢 重設密鑰</DialogTitle></DialogHeader>
          <InputField id="reset-email" label="電子信箱" type="email" icon={Mail} value={resetEmail} onChange={setResetEmail} placeholder="your@email.com" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetOpen(false)} className="rounded-xl font-black text-[10px] uppercase">取消</Button>
            <Button onClick={async () => { await sendPasswordResetEmail(auth, resetEmail); setIsResetOpen(false); }} className="rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/10">發送郵件</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
