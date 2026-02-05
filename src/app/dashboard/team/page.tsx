"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, UserPlus, MoreVertical, Shield, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

/**
 * TeamPage - 職責：管理組織層級的成員存取權
 */
export default function TeamPage() {
  const { organizations, activeOrgId, removeOrgMember, addOrgMember } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  // 安全檢查：確保組織與成員陣列存在
  if (!activeOrg) return null;
  const members = activeOrg.members || [];

  const handleRecruit = () => {
    addOrgMember(activeOrg.id, {
      name: "新進研究員",
      email: `user-${Math.random().toString(36).slice(-4)}@orgverse.io`,
      role: 'Member'
    });
    toast({
      title: "人才招募成功",
      description: "一位新的技術成員已加入此維度。"
    });
  };

  const handleDismiss = (id: string) => {
    removeOrgMember(activeOrg.id, id);
    toast({
      title: "權限已中斷",
      description: "成員已從組織維度中移除。"
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="共鳴團隊" 
        description={`隸屬於 ${activeOrg.name} 組織維度的協作者。`}
      >
        <Button className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10" onClick={handleRecruit}>
          <UserPlus className="w-4 h-4" /> 招募人才
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="border-border/60 hover:shadow-md transition-all overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/20">
                  {member.name[0]}
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                  <CardDescription className="text-[10px] font-mono opacity-70">{member.email}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-primary/5 border-primary/20 text-primary font-bold">
                  {member.role}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{member.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest gap-2">
                  <Mail className="w-3 h-3" /> 聯繫
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  onClick={() => handleDismiss(member.id)}
                  disabled={member.role === 'Owner'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {members.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl bg-muted/5">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
            <p className="text-sm text-muted-foreground">此組織維度目前尚無其他協作者。</p>
          </div>
        )}
      </div>
    </div>
  );
}
