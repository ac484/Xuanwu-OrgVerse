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
  History, 
  Zap, 
  Shield, 
  FileText,
  Calendar,
  Lock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContainerDetailPage() {
  const { id } = useParams();
  const { containers, organizations, activeOrgId } = useAppStore();
  const router = useRouter();

  const container = containers.find(c => c.id === id);
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  if (!container) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Box className="w-16 h-16 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-bold">Container Not Found</h2>
        <Button onClick={() => router.push('/dashboard/containers')}>Return to Fleet</Button>
      </div>
    );
  }

  const isSandbox = container.type === 'sandbox';

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-bold uppercase tracking-widest">Dimension Architecture / {container.name}</span>
      </div>

      <PageHeader 
        title={container.name} 
        description={`Active ${container.type} boundary within ${activeOrg.name}.`}
        badge={
          <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-widest font-bold">
            HEX-ID: {container.id.toUpperCase()}
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Settings className="w-3.5 h-3.5" /> Logic Config
          </Button>
          <Button size="sm" className="h-9 gap-2">
            <Zap className="w-3.5 h-3.5" /> Initialize Resonance
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/40 p-1">
          <TabsTrigger value="overview">Core Logic</TabsTrigger>
          <TabsTrigger value="resources">Resource Stack</TabsTrigger>
          <TabsTrigger value="security">Sovereignty</TabsTrigger>
          <TabsTrigger value="history">Cycle Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {isSandbox ? "Journal Protocol" : "Project Manifest"}
                </CardTitle>
                <CardDescription>Primary data layer for this logical container.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[200px] bg-muted/20 rounded-xl border border-dashed border-border/60 p-8 flex flex-col items-center justify-center text-center">
                  {isSandbox ? (
                    <>
                      <Calendar className="w-10 h-10 text-muted-foreground mb-4 opacity-30" />
                      <p className="text-sm text-muted-foreground">This is your private sandbox area.</p>
                      <Button variant="link" className="text-primary mt-2">Start Daily Entry</Button>
                    </>
                  ) : (
                    <>
                      <Box className="w-10 h-10 text-muted-foreground mb-4 opacity-30" />
                      <p className="text-sm text-muted-foreground">No project artifacts recorded in current cycle.</p>
                      <Button variant="link" className="text-primary mt-2">Forge New Document</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Isolation Level</span>
                    <span className="font-bold">99.9% Absolute</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Resonance Rank</span>
                    <span className="font-bold">S-Tier</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Access strictly confined to {activeOrg.role} level and authorized dimensional proxies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Resonance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-muted rounded">
                        <Zap className="w-3 h-3 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Resonance Initialized</p>
                        <p className="text-[10px] text-muted-foreground">Cycle {2024 - i} Global Synchronization</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">2h ago</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
