
"use client";

import { useAppStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Box, 
  ArrowLeft, 
  Settings, 
  Zap, 
  Shield, 
  Terminal,
  Globe,
  Database
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * ContainerDetailPage
 * 職責：作為邏輯容器的主機，展示基礎設施定義（context, scope, resolver, policy）。
 * 不再干預業務流程，僅作為業務模組的掛載點。
 */
export default function ContainerDetailPage() {
  const { id } = useParams();
  const { containers } = useAppStore();
  const router = useRouter();

  const container = containers.find(c => c.id === id);

  if (!container) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Box className="w-16 h-16 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-bold font-headline">Infrastructure Void</h2>
        <Button onClick={() => router.push('/dashboard/containers')}>Return to Fleet</Button>
      </div>
    );
  }

  // 安全處理
  const scopes = container.scope || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-bold uppercase tracking-widest">Workspace Infrastructure / {container.name}</span>
      </div>

      <PageHeader 
        title={container.name} 
        description={`Runtime Definition: ${container.context}`}
        badge={
          <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-widest font-bold">
            CID: {container.id.toUpperCase()}
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest">
            <Settings className="w-3.5 h-3.5" /> Policy Config
          </Button>
          <Button size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest">
            <Zap className="w-3.5 h-3.5" /> Refresh Resonance
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="infra" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/50">
          <TabsTrigger value="infra" className="text-[10px] font-bold uppercase tracking-widest">Infrastructure Definition</TabsTrigger>
          <TabsTrigger value="capabilities" className="text-[10px] font-bold uppercase tracking-widest">Business Capabilities</TabsTrigger>
          <TabsTrigger value="security" className="text-[10px] font-bold uppercase tracking-widest">Security & Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="infra" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 shadow-sm bg-card/30">
              <CardHeader>
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Globe className="w-3.5 h-3.5" />
                  Contextual Scope
                </CardTitle>
                <CardDescription className="text-xs">Logical boundaries and runtime context.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Runtime Identifier</p>
                  <code className="text-xs text-primary font-mono">{container.context}</code>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-2">Resource Boundaries</p>
                  <div className="flex flex-wrap gap-1.5">
                    {scopes.map(s => (
                      <Badge key={s} variant="secondary" className="text-[9px] uppercase tracking-tighter py-0">{s}</Badge>
                    ))}
                    {scopes.length === 0 && <span className="text-[10px] text-muted-foreground italic">No scopes defined.</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm bg-card/30">
              <CardHeader>
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Database className="w-3.5 h-3.5" />
                  Data Resolution
                </CardTitle>
                <CardDescription className="text-xs">Resolution logic and isolation governance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Resolver Protocol</p>
                  <p className="text-xs font-mono">{container.resolver}</p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-[9px] text-primary uppercase font-bold mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Active Security Policy
                  </p>
                  <p className="text-xs font-semibold">{container.policy}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capabilities">
          <div className="p-16 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
            <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
            <h3 className="text-xl font-bold font-headline">No Capabilities Mounted</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">
              This infrastructure is currently pure. You can mount business modules that respect the defined scope and policy.
            </p>
            <Button variant="outline" className="font-bold text-[10px] uppercase tracking-widest h-10 px-6">
              Scan Compatible Modules
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
