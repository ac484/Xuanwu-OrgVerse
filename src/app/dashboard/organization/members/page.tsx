"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

/**
 * OrganizationMembersPage - 職責：管理維度內的完整人員名單 (Member 清單)
 */
export default function OrganizationMembersPage() {
  const { organizations, activeOrgId, removeOrgMember, addOrgMember } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  if (!activeOrg) return null;

  // 防禦性檢查：確保 members 存在
  const members = activeOrg.members || [];

  const handleAddMember = () => {
    addOrgMember(activeOrg.id, {
      name: "新進研究員",
      email: `user-${Math.random().toString(36).slice(-4)}@orgverse.io`,
      role: 'Member'
    });
    toast({ title: "成員已加入", description: "新的數位身分已同步至維度名單。" });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="維度成員名單" 
        description={`管理隸屬於 ${activeOrg.name} 的所有個人身分。`}
      >
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 h-10 rounded-md font-bold uppercase text-[11px] tracking-widest hover:bg-primary/90 transition-colors shadow-sm" onClick={handleAddMember}>
          <UserPlus className="w-4 h-4" /> 邀請成員
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {member.name?.[0] || 'U'}
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                  <CardDescription className="text-[10px] font-mono">{member.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-[9px] uppercase font-bold bg-primary/5">
                  {member.role}
                </Badge>
                <span className={`text-[10px] uppercase font-bold ${member.status === 'active' ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {member.status}
                </span>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold">聯繫</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeOrgMember(activeOrg.id, member.id)}
                  disabled={member.role === 'Owner'}
                  className="h-8 hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
