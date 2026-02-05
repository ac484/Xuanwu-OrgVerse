
"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, ShieldX, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

/**
 * ExternalGatewayPage - 職責：外部維度閘道管理
 * 專門管理組織內的 Guest 或外部合作夥伴，監控存取期限與隔離狀態。
 */
export default function ExternalGatewayPage() {
  const { organizations, activeOrgId, updateOrgMember, removeOrgMember } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId);
  if (!activeOrg) return null;

  const externalMembers = (activeOrg.members || []).filter(m => m.isExternal || m.role === 'Guest');

  const handleExtendExpiry = (memberId: string) => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // 實施持久化閉環：更新 Store 中的到期日
    updateOrgMember(activeOrg.id, memberId, { 
      expiryDate: nextMonth.toISOString() 
    });
    
    toast({ 
      title: "權限已延展", 
      description: `該外部身分的有效期限已自動延展至 ${nextMonth.toLocaleDateString()}。` 
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="外部維度閘道" 
        description="管理外部合作夥伴與訪客的受限存取權，實施嚴格的維度隔離與限時授權策略。"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {externalMembers.map((member) => (
          <Card key={member.id} className="border-border/60 bg-card/50 backdrop-blur-sm border-l-4 border-l-accent shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold border-accent/30 text-accent">
                  {member.role}
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
              <CardDescription className="text-[10px] font-mono">{member.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">到期日</span>
                </div>
                <span className="text-xs font-mono font-bold">
                  {member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : '永久授權'}
                </span>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-border/20">
                <button 
                  className="flex-1 h-8 bg-background border rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-colors" 
                  onClick={() => handleExtendExpiry(member.id)}
                >
                   延展權限
                </button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-destructive hover:bg-destructive/5"
                  onClick={() => removeOrgMember(activeOrg.id, member.id)}
                >
                  <ShieldX className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {externalMembers.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 flex flex-col items-center">
            <Globe className="w-12 h-12 text-muted-foreground mb-4 opacity-10" />
            <p className="text-sm text-muted-foreground">當前維度內無活躍的外部合作夥伴。</p>
          </div>
        )}
      </div>
    </div>
  );
}
