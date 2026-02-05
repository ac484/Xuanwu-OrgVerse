"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ShieldCheck, Activity, Users, ArrowUpRight, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { organizations, activeOrgId, containers } = useAppStore();
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  const orgContainers = containers.filter(c => c.orgId === activeOrgId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px] tracking-widest font-bold bg-primary/5">
              Dimension: {activeOrg.name}
            </Badge>
            {activeOrg.isExternal && (
              <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-accent/20 text-accent-foreground border-accent/30">
                External Resource
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Organization Pulse</h1>
          <p className="text-muted-foreground">{activeOrg.context}</p>
        </div>
        <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border/50">
          <div className="flex flex-col items-center px-4 border-r">
            <span className="text-2xl font-bold font-headline">{orgContainers.length}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Containers</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-xs text-muted-foreground uppercase font-bold mb-1">Permission Level</span>
            <Badge className="font-headline">{activeOrg.role}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Logical Sovereignty</CardTitle>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Absolute Isolation</div>
            <p className="text-xs text-muted-foreground mt-1">
              Data strictly layered within {activeOrg.name} boundaries.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold">
                <span>Encryption Integrity</span>
                <span>99.9%</span>
              </div>
              <Progress value={99.9} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Dimension Resonance</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active Stream</div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time collaboration across 4 endpoints.
            </p>
            <div className="flex items-center gap-1 mt-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                  U{i}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                +12
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Container Growth</CardTitle>
            <Layers className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12% Established</div>
            <p className="text-xs text-muted-foreground mt-1">
              Expansion from last cycle benchmarks.
            </p>
            <div className="mt-4 flex items-center gap-2 text-primary">
              <Zap className="w-4 h-4 fill-primary" />
              <span className="text-xs font-bold uppercase tracking-tight">Lightning Access Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">Recent Containers</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {orgContainers.length > 0 ? orgContainers.map(c => (
              <div key={c.id} className="p-4 bg-card border border-border/60 rounded-xl flex items-center justify-between hover:bg-muted/30 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-lg text-primary">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">Type: {c.type}</p>
                  </div>
                </div>
                <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">Open</Badge>
              </div>
            )) : (
              <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center">
                <Layers className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
                <p className="text-sm text-muted-foreground">No logical containers established yet.</p>
                <button className="mt-4 text-xs font-bold text-primary uppercase tracking-widest hover:underline">+ Forge First Container</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold font-headline">Permission Constellation</h2>
          <Card className="border-border/60 overflow-hidden">
            <div className="p-4 bg-primary/5 border-b flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest">Active Model</span>
              <Badge variant="outline" className="bg-background">Progressive Access</Badge>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                <PermissionTier 
                  name="Owner" 
                  description="Supreme sovereignty. Destruct container rights." 
                  active={activeOrg.role === 'Owner'} 
                />
                <PermissionTier 
                  name="Admin" 
                  description="Operations commander. Resource allocation." 
                  active={activeOrg.role === 'Admin'} 
                />
                <PermissionTier 
                  name="Member" 
                  description="Value creator. Full read/write within scope." 
                  active={activeOrg.role === 'Member'} 
                />
                <PermissionTier 
                  name="Guest" 
                  description="Restricted observer. Invisible to other dimensions." 
                  active={activeOrg.role === 'Guest'} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PermissionTier({ name, description, active }: { name: string, description: string, active: boolean }) {
  return (
    <div className={`p-4 flex items-center gap-4 transition-colors ${active ? 'bg-primary/5' : ''}`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${active ? 'text-primary' : ''}`}>{name}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </div>
      {active && <Badge className="text-[9px] h-4">Current</Badge>}
    </div>
  );
}