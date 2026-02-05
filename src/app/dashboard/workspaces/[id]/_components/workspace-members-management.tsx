"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Trash2, Shield, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export function WorkspaceMembersManagement() {
  const { workspace, emitEvent } = useWorkspace();
  const { organizations, activeOrgId, addWorkspaceMember, removeWorkspaceMember } = useAppStore();
  const [search, setSearch] = useState("");

  const activeOrg = organizations.find(o => o.id === activeOrgId);
  const allOrgMembers = activeOrg?.members || [];
  
  const currentMemberIds = (workspace.members || []).map(m => m.id);
  const eligibleMembers = allOrgMembers.filter(m => !currentMemberIds.includes(m.id));

  const handleAdd = (member: any) => {
    addWorkspaceMember(workspace.id, member);
    emitEvent("授權空間存取", member.name);
    toast({ title: "成員已授權", description: `${member.name} 已掛載至此空間。` });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4" /> 已授權人員 ({(workspace.members || []).length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(workspace.members || []).map(member => (
            <Card key={member.id} className="bg-card/40 border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {member.name[0]}
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
                  onClick={() => {
                    removeWorkspaceMember(workspace.id, member.id);
                    emitEvent("撤銷空間存取", member.name);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> 維度成員池
        </h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input 
            placeholder="搜尋維度人員..." 
            className="pl-9 h-9 text-xs bg-muted/20 border-border/40 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Card className="bg-card/40 border-border/60">
          <CardContent className="p-4 space-y-3">
            {eligibleMembers.filter(m => m.name.includes(search)).map(member => (
              <div key={member.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-background border flex items-center justify-center text-[10px]">
                    {member.name[0]}
                  </div>
                  <span className="text-[11px] font-medium">{member.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[10px] font-bold uppercase text-primary"
                  onClick={() => handleAdd(member)}
                >
                  授權
                </Button>
              </div>
            ))}
            {eligibleMembers.length === 0 && (
              <p className="text-[10px] text-center text-muted-foreground italic py-4">
                維度內所有成員皆已授權。
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
