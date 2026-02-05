"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Fingerprint, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * 登入頁面 - 職責：身分主權驗證入口
 */
export default function LoginPage() {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("12345");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAppStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 模擬 SSO 邏輯
    setTimeout(() => {
      if (username === "demo" && password === "12345") {
        login({ id: "u1", name: "展示用戶", email: "demo@orgverse.io" });
        toast({
          title: "身分驗證成功",
          description: "全域上下文環境已激活。",
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "驗證失敗",
          description: "無效的認證資訊。請嘗試 demo / 12345。",
        });
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="absolute top-10 flex items-center gap-2">
        <Shield className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold tracking-tight font-headline">OrgVerse</span>
      </div>
      
      <Card className="w-full max-w-md border-border/50 shadow-xl overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardHeader className="space-y-2 pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Fingerprint className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-headline">數位主權閘道器</CardTitle>
          <CardDescription className="text-center">
            請驗證您的身分以建立邏輯存在。
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">數位身分 ID</Label>
              <div className="relative">
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="使用者名稱"
                  className="pl-10"
                />
                <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">安全權杖 (Token)</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="密碼"
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full h-11 text-lg font-medium" disabled={isLoading}>
              {isLoading ? "正在同步維度..." : "建立身分共振"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              登入即表示您同意激活跨維度的權限授權。
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
