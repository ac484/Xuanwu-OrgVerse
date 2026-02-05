"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, UserPlus, MoreVertical, Shield } from "lucide-react";

export default function TeamPage() {
  const { teamMembers, organizations, activeOrgId } = useAppStore();
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="Resonance Team" 
        description={`Active collaborators within the ${activeOrg.name} dimension.`}
      >
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Recruit Talent
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="border-border/60 hover:shadow-md transition-all overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {member.name[0]}
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                  <CardDescription className="text-[10px]">{member.email}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-primary/5 border-primary/20 text-primary">
                  {member.role}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">{member.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest gap-2">
                  <Mail className="w-3 h-3" /> Contact
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest gap-2">
                  <Shield className="w-3 h-3" /> Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
