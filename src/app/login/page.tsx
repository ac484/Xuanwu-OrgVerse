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

export default function LoginPage() {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("12345");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAppStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate SSO logic
    setTimeout(() => {
      if (username === "demo" && password === "12345") {
        login({ id: "u1", name: "Demo User", email: "demo@orgverse.io" });
        toast({
          title: "Identity Verified",
          description: "Global context environment activated.",
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "Invalid credentials. Please try demo / 12345.",
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
          <CardTitle className="text-2xl text-center font-headline">Digital Sovereignty Gateway</CardTitle>
          <CardDescription className="text-center">
            Sign in to establish your logical presence.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Digital ID</Label>
              <div className="relative">
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Username"
                  className="pl-10"
                />
                <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Token</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password"
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full h-11 text-lg font-medium" disabled={isLoading}>
              {isLoading ? "Synchronizing Dimensions..." : "Establish Identity"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you activate your cross-boundary resonance permissions.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}