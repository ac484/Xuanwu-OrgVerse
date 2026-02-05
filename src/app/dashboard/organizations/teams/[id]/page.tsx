"use client";

import { useAppStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Trash2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { doc, updateDoc } from "firebase/firestore";

export default function OrganizationTeamDetailPage() {
  const { id } = useParams();
  const { organizations, activeOrgId } = useAppStore();
  const { db } = useFirebase();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId);
  const teamIndex = activeOrg?.teams?.findIndex(t => t.id === id);
  const team = activeOrg?.teams?.[teamIndex ?? -1];

  if (!team || teamIndex === undefined || teamIndex === -1) return <div className="p-20 text-center">團隊不存在。</div>;

  const allMembers = activeOrg?.members || [];
  const teamMemberIds = team.memberIds || [];
  const teamMembers = allMembers.filter(m => teamMemberIds.includes(m.id));
  const otherOrgMembers = allMembers.filter(m => !teamMemberIds.includes(m.id));

  const updateTeamMembers = (newIds: string[]) => {
    const orgRef = doc(db, "organizations", activeOrg!.id);
    const updatedTeams = [...activeOrg!.teams];
    updatedTeams[teamIndex] = { ...team, memberIds: newIds };
    
    updateDoc(orgRef, { teams: updatedTeams });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-bold uppercase tracking-widest">團隊管理 / {team.name}</span>
      </div>

      <PageHeader 
        title={team.name} 
        description={team.description}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">團隊成員 ({teamMembers.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map(member => (
              <Card key={member.id} className="border-border/60 bg-card/40 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {member.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => updateTeamMembers(teamMemberIds.filter(mid => mid !== member.id))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">可分配成員</h3>
          <Card className="border-border/60 bg-muted/5">
            <CardContent className="p-4 space-y-4">
              {otherOrgMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between group">
                  <span className="text-xs font-medium">{member.name}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase text-primary" onClick={() => updateTeamMembers([...teamMemberIds, member.id])}>
                    加入
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
