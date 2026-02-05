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

/**
 * OrganizationTeamDetailPage - 職責：管理特定團隊內的成員 (Team Member 清單)
 */
export default function OrganizationTeamDetailPage() {
  const { id } = useParams();
  const { organizations, activeOrgId, addMemberToTeam, removeMemberFromTeam } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  const team = activeOrg?.teams?.find(t => t.id === id);

  if (!team) return <div className="p-20 text-center">團隊不存在。</div>;

  // 防禦性檢查：確保陣列屬性存在
  const allMembers = activeOrg.members || [];
  const teamMemberIds = team.memberIds || [];

  // 獲取該團隊內的成員詳細資料
  const teamMembers = allMembers.filter(m => teamMemberIds.includes(m.id));
  // 獲取不在該團隊內的其餘組織成員
  const otherOrgMembers = allMembers.filter(m => !teamMemberIds.includes(m.id));

  const handleAddMember = (memberId: string) => {
    addMemberToTeam(activeOrg.id, team.id, memberId);
    toast({ title: "成員已分派", description: "已將成員加入此團隊。" });
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
                    onClick={() => removeMemberFromTeam(activeOrg.id, team.id, member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {teamMembers.length === 0 && (
              <div className="col-span-full p-12 border-2 border-dashed rounded-xl text-center">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-10" />
                <p className="text-xs text-muted-foreground">目前尚無成員分配至此團隊。</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">可分配成員</h3>
          <Card className="border-border/60 bg-muted/5">
            <CardContent className="p-4 space-y-4">
              {otherOrgMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-background border flex items-center justify-center text-[10px]">
                      {member.name?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-medium">{member.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-primary" onClick={() => handleAddMember(member.id)}>
                    <UserPlus className="w-3.5 h-3.5 mr-1" /> 加入
                  </Button>
                </div>
              ))}
              {otherOrgMembers.length === 0 && (
                <p className="text-[10px] text-center text-muted-foreground italic py-4">
                  維度內所有成員皆已加入。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
