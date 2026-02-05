"use client";

import { useWorkspace } from "../../workspace-context";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Globe, 
  User, 
  Plus, 
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirebase } from "@/firebase/provider";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

/**
 * WorkspaceMembersManagement - 職責：空間全方位存取治理
 * 實現「部門團隊」、「合作夥伴」與「獨立成員」的三維授權體系。
 */
export function WorkspaceMembersManagement() {
  const { workspace, emitEvent } = useWorkspace();
  const { organizations, activeOrgId } = useAppStore();
  const { db } = useFirebase();

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId),
    [organizations, activeOrgId]
  );

  const handleToggleTeam = (teamId: string, teamName: string, isAuthorized: boolean) => {
    const wsRef = doc(db, "workspaces", workspace.id);
    const operation = isAuthorized ? arrayRemove(teamId) : arrayUnion(teamId);
    
    updateDoc(wsRef, { teamIds: operation }).then(() => {
      emitEvent(isAuthorized ? "撤銷團隊權限" : "授權部門團隊", teamName);
      toast({ title: isAuthorized ? "權限已中斷" : "團隊已掛載" });
    });
  };

  const handleTogglePartner = (groupId: string, groupName: string, isAuthorized: boolean) => {
    const wsRef = doc(db, "workspaces", workspace.id);
    const operation = isAuthorized ? arrayRemove(groupId) : arrayUnion(groupId);
    
    updateDoc(wsRef, { partnerGroupIds: operation }).then(() => {
      emitEvent(isAuthorized ? "卸載夥伴群組" : "授權合作夥伴", groupName);
      toast({ title: isAuthorized ? "夥伴存取中斷" : "夥伴群組已共振" });
    });
  };

  const handleToggleIndividual = (member: any, isAuthorized: boolean) => {
    const wsRef = doc(db, "workspaces", workspace.id);
    const operation = isAuthorized ? arrayRemove(member) : arrayUnion(member);
    
    updateDoc(wsRef, { members: operation }).then(() => {
      emitEvent(isAuthorized ? "撤銷個人存取" : "授權個人存在", member.name);
      toast({ title: isAuthorized ? "身分已註銷" : "身分已同步" });
    });
  };

  if (!activeOrg) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> 空間存取治理中心
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">治理策略：三維群組授權矩陣</p>
        </div>
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl">
          <TabsTrigger value="teams" className="text-[10px] font-bold uppercase tracking-widest px-6 data-[state=active]:text-primary">
            部門團隊 ({(activeOrg.teams || []).length})
          </TabsTrigger>
          <TabsTrigger value="partners" className="text-[10px] font-bold uppercase tracking-widest px-6 data-[state=active]:text-accent">
            合作夥伴 ({(activeOrg.partnerGroups || []).length})
          </TabsTrigger>
          <TabsTrigger value="individuals" className="text-[10px] font-bold uppercase tracking-widest px-6">
            獨立成員 ({(activeOrg.members || []).length})
          </TabsTrigger>
        </TabsList>

        {/* 1. 部門團隊分頁 */}
        <TabsContent value="teams" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeOrg.teams || []).map(team => {
            const isAuthorized = (workspace.teamIds || []).includes(team.id);
            return (
              <Card key={team.id} className={`border-border/60 transition-all ${isAuthorized ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'bg-card/40'}`}>
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isAuthorized ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{team.name}</CardTitle>
                      <CardDescription className="text-[9px] uppercase font-bold">{(team.memberIds || []).length} 位成員</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant={isAuthorized ? "destructive" : "outline"} 
                    size="sm" 
                    className="h-7 text-[9px] font-bold uppercase tracking-widest"
                    onClick={() => handleToggleTeam(team.id, team.name, isAuthorized)}
                  >
                    {isAuthorized ? "撤銷授權" : "掛載團隊"}
                  </Button>
                </CardHeader>
                {isAuthorized && (
                  <CardContent className="p-4 pt-0">
                    <div className="mt-3 p-2 bg-background/50 rounded-lg border border-primary/10 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest">存取共振中</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* 2. 合作夥伴分頁 */}
        <TabsContent value="partners" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeOrg.partnerGroups || []).map(group => {
            const isAuthorized = (workspace.partnerGroupIds || []).includes(group.id);
            return (
              <Card key={group.id} className={`border-border/60 transition-all ${isAuthorized ? 'bg-accent/5 border-accent/30 ring-1 ring-accent/20' : 'bg-card/40'}`}>
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isAuthorized ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{group.name}</CardTitle>
                      <CardDescription className="text-[9px] uppercase font-bold">{(group.memberIds || []).length} 位夥伴</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant={isAuthorized ? "destructive" : "outline"} 
                    size="sm" 
                    className="h-7 text-[9px] font-bold uppercase tracking-widest"
                    onClick={() => handleTogglePartner(group.id, group.name, isAuthorized)}
                  >
                    {isAuthorized ? "移除夥伴" : "同步權限"}
                  </Button>
                </CardHeader>
                {isAuthorized && (
                  <CardContent className="p-4 pt-0">
                    <div className="mt-3 p-2 bg-background/50 rounded-lg border border-accent/10 flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3 text-accent" />
                      <span className="text-[9px] font-bold text-accent uppercase tracking-widest">外部受控存取</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* 3. 獨立成員分頁 */}
        <TabsContent value="individuals" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeOrg.members || []).map(member => {
            const isAuthorizedManually = (workspace.members || []).some(m => m.id === member.id);
            // 檢查是否已透過團隊或夥伴群組獲得權限
            const isInAuthorizedTeam = (activeOrg.teams || [])
              .some(t => (workspace.teamIds || []).includes(t.id) && t.memberIds.includes(member.id));
            const isInAuthorizedPartner = (activeOrg.partnerGroups || [])
              .some(g => (workspace.partnerGroupIds || []).includes(g.id) && g.memberIds.includes(member.id));
            
            const hasInheritedAccess = isInAuthorizedTeam || isInAuthorizedPartner;

            return (
              <Card key={member.id} className={`border-border/60 ${hasInheritedAccess ? 'opacity-60 bg-muted/20' : 'bg-card/40'}`}>
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border shadow-sm">
                      {member.name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[7px] h-3.5 px-1 uppercase tracking-tighter">
                          {member.role}
                        </Badge>
                        {hasInheritedAccess && (
                          <Badge variant="secondary" className="text-[7px] h-3.5 px-1 bg-primary/10 text-primary border-none font-black uppercase">
                            Inherited
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {!hasInheritedAccess && (
                    <Button 
                      variant={isAuthorizedManually ? "destructive" : "ghost"} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleToggleIndividual(member, isAuthorizedManually)}
                    >
                      {isAuthorizedManually ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </Button>
                  )}
                </CardHeader>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      <div className="p-6 bg-muted/30 border border-dashed rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-widest">存取治理原則</h4>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
          本空間採用「組合式授權」。成員的最終存取權 = (團隊繼承權 ∪ 夥伴群組權 ∪ 個人直接授權)。
          當成員透過多重路徑獲得權限時，系統將採取「最寬鬆原則 (Least Restrictive)」確保其作業脈動不受中斷。
        </p>
      </div>
    </div>
  );
}