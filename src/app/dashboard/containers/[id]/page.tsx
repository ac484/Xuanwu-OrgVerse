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
  Lock,
  Globe,
  Database
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * ContainerDetailPage
 * 職責：作為邏輯容器的主機，展示基礎設施定義，並作為業務模組的掛載點。
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
        <h2 className="text-xl font-bold">Workspace Architecture Missing</h2>
        <Button onClick={() => router.push('/dashboard/containers')}>Return to Fleet</Button>
      </div>
    );
  }

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
        description={`Infrastructure Definition: ${container.context}`}
        badge={
          <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-widest font-bold">
            CID: {container.id.toUpperCase()}
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Settings className="w-3.5 h-3.5" /> Policy Config
          </Button>
          <Button size="sm" className="h-9 gap-2">
            <Zap className="w-3.5 h-3.5" /> Synchronize Context
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="infra" className="space-y-6">
        <TabsList className="bg-muted/40 p-1">
          <TabsTrigger value="infra">Infrastructure Definition</TabsTrigger>
          <TabsTrigger value="capabilities">Business Capabilities</TabsTrigger>
          <TabsTrigger value="security">Policy & Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="infra" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Context & Scope
                </CardTitle>
                <CardDescription>Logical boundaries for this workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Runtime Context</p>
                  <code className="text-xs text-primary">{container.context}</code>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Resource Scope</p>
                  <div className="flex flex-wrap gap-2">
                    {container.scope.map(s => (
                      <Badge key={s} variant="secondary" className="text-[9px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  Resolver & Policy
                </CardTitle>
                <CardDescription>Data resolution and security governance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Data Resolver</p>
                  <p className="text-xs font-mono">{container.resolver}</p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                  <p className="text-[10px] text-primary uppercase font-bold mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Active Policy
                  </p>
                  <p className="text-xs font-semibold">{container.policy}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capabilities">
          <div className="p-12 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
            <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold">Mount Business Modules</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              This workspace provides the scope. You can now mount independent capability modules here.
            </p>
            <Button variant="outline" className="font-bold text-xs uppercase tracking-widest">
              Scan Available Modules
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
