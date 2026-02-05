"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Users, Zap, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { organizations, activeOrgId } = useAppStore();
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  const handleSave = () => {
    toast({
      title: "Root Logic Updated",
      description: "Organizational core parameters have been synchronized.",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dimension Architecture</h1>
        <p className="text-muted-foreground">Manage the root logic and sovereignty of {activeOrg.name}.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Zap className="w-4 h-4 fill-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Dimension Core</span>
            </div>
            <CardTitle className="font-headline">Identity & Context</CardTitle>
            <CardDescription>Global parameters for this organizational dimension.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">Display Designation</Label>
              <Input id="org-name" defaultValue={activeOrg.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-context">Resonance Context</Label>
              <Input id="org-context" defaultValue={activeOrg.context} />
              <p className="text-[10px] text-muted-foreground">Influences UI adaptation and resource priority.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t">
            <Button onClick={handleSave} className="ml-auto">Synchronize Logic</Button>
          </CardFooter>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Security Layer</span>
            </div>
            <CardTitle className="font-headline">Sovereignty Protocols</CardTitle>
            <CardDescription>Control how data silos are established and maintained.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Absolute Physical Isolation</Label>
                <p className="text-sm text-muted-foreground">Force strict logical layering for all containers.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Cross-Boundary Granting</Label>
                <p className="text-sm text-muted-foreground">Allow external dimensions to access authorized hub resources.</p>
              </div>
              <Switch defaultChecked={!activeOrg.isExternal} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">GenAI Environment Adaptation</Label>
                <p className="text-sm text-muted-foreground">Automatically adjust UI resonance based on active context.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 border-2 bg-destructive/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Ultimate Authority</span>
            </div>
            <CardTitle className="font-headline text-destructive">Destruction Protocol</CardTitle>
            <CardDescription className="text-destructive/80">Irreversibly dissolve this organizational dimension and all its containers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-medium text-destructive mb-4">
              Requires Owner-level sovereignty. This action cannot be undone within the OrgVerse architecture.
            </p>
            <Button variant="destructive" className="font-bold uppercase tracking-widest text-xs" disabled={activeOrg.role !== 'Owner'}>
              Initiate Dissolution
            </Button>
            {activeOrg.role !== 'Owner' && (
              <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Insufficient permission for destruction logic. Current: {activeOrg.role}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}