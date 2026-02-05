"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ExternalLink, 
  Clock, 
  ShieldX, 
  Globe, 
  Plus, 
  ShieldAlert, 
  ShieldCheck,
  Zap,
  UserPlus
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

/**
 * ExternalGatewayPage - 職責：外部維度閘道管理 (Lease-based Access Control)
 * 實現「租約式存取」與「協議隔離」的深度治理。
 */
export default function ExternalGatewayPage() {
  const organizations = useAppStore(state => state.organizations);
  const activeOrgId = useAppStore(state => state.activeOrgId);
  const updateOrgMember = useAppStore(state => state.updateOrgMember);
  const removeOrgMember = useAppStore(state => state.removeOrgMember);
  const addOrgMember = useAppStore(state => state.addOrgMember);

  const [isRecruitOpen, setIsRecruitOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", email: "", protocol: "Deep Isolation" });

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId),
    [organizations, activeOrgId]
  );

  const externalMembers = useMemo(() => 
    (activeOrg?.members || []).filter(m => m.isExternal || m.role === 'Guest'),
    [activeOrg?.members]
  );

  if (!activeOrg) return null;

  const handleRecruit = () => {
    if (!newPartner.name || !newPartner.email) return;
    
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1); // 預設一個月租約

    addOrgMember(activeOrg.id, {
      name: newPartner.name,
      email: newPartner.email,
      role: 'Guest',
      isExternal: true,
      expiryDate: expiry.toISOString(),
      accessProtocol: newPartner.protocol as any
    });

    setIsRecruitOpen(false);
    setNewPartner({ name: "", email: "", protocol: "Deep Isolation" });
    toast({ title: "外部招募協議已發送", description: `${newPartner.name} 已獲得暫時性維度存取權。` });
  };

  const handleExtendLease = (memberId: string, currentExpiry?: string) => {
    const baseDate = currentExpiry ? new Date(currentExpiry) : new Date();
    baseDate.setMonth(baseDate.getMonth() + 1);
    
    updateOrgMember(activeOrg.id, memberId, { 
      expiryDate: baseDate.toISOString() 
    });
    
    toast({ 
      title: "租約已延展", 
      description: `該身分的有效期限已自動同步至全域時間線。` 
    });
  };

  const calculateRemainingDays = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="外部維度閘道" 
        description="管理跨維度合作夥伴的受限身分。實施「租約式存取」與「強隔離協議」。"
      >
        <Button 
          className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10 px-6 shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90"
          onClick={() => setIsRecruitOpen(true)}
        >
          <UserPlus className="w-4 h-4" /> 招募外部夥伴
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {externalMembers.map((member) => {
          const daysLeft = calculateRemainingDays(member.expiryDate);
          const isCritical = daysLeft !== null && daysLeft < 7;
          
          return (
            <Card key={member.id} className="border-border/60 bg-card/40 backdrop-blur-sm border-l-4 border-l-accent shadow-sm group overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isCritical ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-accent/10 text-accent'}`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold border-accent/30 text-accent">
                    {member.accessProtocol || 'Standard Bridge'}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold group-hover:text-accent transition-colors">{member.name}</CardTitle>
                <CardDescription className="text-[10px] font-mono opacity-60">{member.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-widest">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 存取租約剩餘
                    </span>
                    <span className={isCritical ? 'text-destructive' : 'text-foreground'}>
                      {daysLeft !== null ? `${daysLeft} 天` : '永久'}
                    </span>
                  </div>
                  {daysLeft !== null && (
                    <Progress value={(daysLeft / 30) * 100} className="h-1 bg-accent/10" />
                  )}
                </div>

                <div className="p-3 bg-muted/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">隔離等級</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-accent">
                      {member.accessProtocol === 'Deep Isolation' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      {member.accessProtocol === 'Deep Isolation' ? '極高隔離' : '受控協作'}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-border/20">
                  <Button 
                    variant="outline"
                    className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-accent/5 hover:text-accent"
                    onClick={() => handleExtendLease(member.id, member.expiryDate)}
                  >
                     延展租約
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-destructive hover:bg-destructive/10"
                    onClick={() => removeOrgMember(activeOrg.id, member.id)}
                  >
                    <ShieldX className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {externalMembers.length === 0 && (
          <div className="col-span-full p-24 text-center border-2 border-dashed rounded-3xl bg-muted/5 flex flex-col items-center">
            <Globe className="w-16 h-16 text-muted-foreground mb-6 opacity-10" />
            <h3 className="text-xl font-bold font-headline mb-2">閘道器待機中</h3>
            <p className="text-sm text-muted-foreground max-w-sm">目前維度內無活跃的外部存取。您可以透過「招募」功能邀請夥伴。</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-accent/5 border border-accent/10 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-accent">
            <Zap className="w-4 h-4 fill-accent" />
            <h4 className="text-xs font-bold uppercase tracking-widest">閘道器安全守則</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            外部身分（Guest）不具備維度主權。所有操作均在隔離沙盒中執行。一旦租約過期，該身分的所有數位紀錄將被封鎖，直到租約延展。
          </p>
        </div>
        <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">協議自動化</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            系統會根據外部身分的活躍度自動評估風險。若偵測到異常活動，B 軌 (Issues) 將自動建立「存取異常單」並通知管理員。
          </p>
        </div>
      </div>

      <Dialog open={isRecruitOpen} onOpenChange={setIsRecruitOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">招募外部夥伴</DialogTitle>
            <DialogDescription>發送暫時性的數位共振邀請，並設定存取隔離協議。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>顯示稱號</Label>
              <Input 
                value={newPartner.name} 
                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} 
                placeholder="例如: 外部審核官" 
              />
            </div>
            <div className="space-y-2">
              <Label>聯絡端點 (Email)</Label>
              <Input 
                value={newPartner.email} 
                onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })} 
                placeholder="partner@external.io" 
              />
            </div>
            <div className="space-y-2">
              <Label>存取隔離協議</Label>
              <Select 
                value={newPartner.protocol} 
                onValueChange={(v) => setNewPartner({ ...newPartner, protocol: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deep Isolation">Deep Isolation (極高隔離)</SelectItem>
                  <SelectItem value="Standard Bridge">Standard Bridge (標準協作)</SelectItem>
                  <SelectItem value="Full Collaborative">Full Collaborative (全域共振)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecruitOpen(false)}>取消</Button>
            <Button onClick={handleRecruit} className="bg-accent hover:bg-accent/90">啟動協議</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
