"use client";

import { UserRole } from "@/types/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

/**
 * PermissionConstellation - 職責：展示當前維度的權限階層架構
 */
export function PermissionConstellation({ currentRole }: { currentRole: UserRole }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-headline tracking-tight">Permission Constellation</h2>
      <Card className="border-border/60 overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="p-4 bg-primary/5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Active Model</span>
          </div>
          <Badge variant="outline" className="bg-background text-[9px] uppercase font-bold tracking-tighter">Progressive Access</Badge>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            <PermissionTier 
              name="Owner" 
              description="Supreme sovereignty. Destruct container rights." 
              active={currentRole === 'Owner'} 
            />
            <PermissionTier 
              name="Admin" 
              description="Operations commander. Resource allocation." 
              active={currentRole === 'Admin'} 
            />
            <PermissionTier 
              name="Member" 
              description="Value creator. Full read/write within scope." 
              active={currentRole === 'Member'} 
            />
            <PermissionTier 
              name="Guest" 
              description="Restricted observer. Invisible to other dimensions." 
              active={currentRole === 'Guest'} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PermissionTier({ name, description, active }: { name: string, description: string, active: boolean }) {
  return (
    <div className={`p-4 flex items-center gap-4 transition-all duration-300 ${active ? 'bg-primary/5' : 'grayscale-[0.5] opacity-60'}`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${active ? 'text-primary' : ''}`}>{name}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </div>
      {active && <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-primary/20">Current</Badge>}
    </div>
  );
}
