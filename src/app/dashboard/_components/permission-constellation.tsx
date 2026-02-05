"use client";

import { UserRole } from "@/types/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PermissionConstellation({ currentRole }: { currentRole: UserRole }) {
  return (
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
