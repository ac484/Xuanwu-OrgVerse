"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Handshake, 
  MailPlus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  ShieldCheck,
  SendHorizontal
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
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * PartnersPage - 職責：管理跨維度合作夥伴邀請 (External Partners)
 * 已遷移至單數 organization 路徑。
 */
export default function PartnersPage() {
  const { organizations, activeOrgId } = useAppStore();
  const { db } = useFirebase();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteInviteEmail] = useState("");

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId),
    [organizations, activeOrgId]
  );

  // 實時偵聽雲端邀請函
  const invitesQuery = useMemo(() => {
    if (!activeOrgId || !db) return null;
    return query(
      collection(db, "organizations", activeOrgId, "invites"),
      orderBy("invitedAt", "desc")
    );
  }, [activeOrgId, db]);

  const { data: invites } = useCollection<any>(invitesQuery);

  const handleSendInvite = () => {
    if (!inviteEmail.trim() || !activeOrgId) return;

    const inviteData = {
      email: inviteEmail,
      status: 'pending',
      role: 'Guest',
      invitedAt: serverTimestamp(),
      protocol: 'Standard Bridge'
    };

    const inviteCol = collection(db, "organizations", activeOrgId, "invites");
    
    addDoc(inviteCol, inviteData)
      .then(() => {
        setInviteInviteEmail("");
        setIsInviteOpen(false);
        toast({ title: "邀請函已發送", description: `${inviteEmail} 將收到共振請求。` });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: `organizations/${activeOrgId}/invites`,
          operation: 'create',
          requestResourceData: inviteData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  };

  if (!activeOrg) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="合作夥伴" 
        description="管理跨維度的外部招募。透過 Email 邀請新夥伴，需經對方同意後方可完成共振。"
      >
        <Button className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10 px-6 shadow-lg shadow-primary/20" onClick={() => setIsInviteOpen(true)}>
          <MailPlus className="w-4 h-4" /> 招募夥伴
        </Button>
      </PageHeader>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl">
          <TabsTrigger value="pending" className="text-xs font-bold uppercase tracking-widest px-6">待處理邀請 ({(invites || []).filter(i => i.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="active" className="text-xs font-bold uppercase tracking-widest px-6">已共振夥伴</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(invites || []).filter(i => i.status === 'pending').map((invite) => (
              <Card key={invite.id} className="border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary">
                      <Clock className="w-4 h-4" />
                    </div>
                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest">等待同意</Badge>
                  </div>
                  <CardTitle className="text-sm font-bold truncate">{invite.email}</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-mono opacity-60">Protocol: {invite.protocol}</CardDescription>
                </CardHeader>
                <CardFooter className="border-t border-border/10 py-3 bg-muted/5 flex justify-between">
                  <span className="text-[9px] text-muted-foreground italic">發送於: 剛才</span>
                  <Button variant="ghost" size="sm" className="h-7 text-destructive hover:bg-destructive/10 text-[9px] font-bold uppercase">
                    撤回邀請
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {(invites || []).filter(i => i.status === 'pending').length === 0 && (
              <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl opacity-20">
                <SendHorizontal className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">尚無待處理的邀請</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="p-20 text-center bg-muted/5 border border-border/40 rounded-3xl">
            <Handshake className="w-12 h-12 mx-auto mb-4 text-primary opacity-20" />
            <p className="text-sm text-muted-foreground">一旦夥伴接受 Email 邀請，他們將出現在此清單中。</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">招募規則聲明</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            招募「合作夥伴」需使用外部 Email 地址。系統將在雲端建立一個暫時性的「邀請節點」。當該夥伴使用對應 Email 登入 OrgVerse 並在「邀請中心」點擊同意後，其數位身分將正式掛載至當前維度。
          </p>
        </div>
        <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserCheck className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">主權同意機制</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            不同於內部的「部門團隊」直接指派，外部招募必須經過「雙向共振」——維度管理員發起，夥伴主動接受。這確保了跨維度協作的合規性與數位主權。
          </p>
        </div>
      </div>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <MailPlus className="w-6 h-6 text-primary" /> 發送招募邀請
            </DialogTitle>
            <DialogDescription>輸入合作夥伴的 Email 進行數位共振。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>夥伴電子信箱 (Email)</Label>
              <Input 
                value={inviteEmail} 
                onChange={(e) => setInviteInviteEmail(e.target.value)} 
                placeholder="partner@external-corp.io" 
                className="rounded-xl h-11"
              />
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground italic">
                系統將自動為受邀者分配「Guest」角色，並套用「Standard Bridge」隔離協議。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>取消</Button>
            <Button onClick={handleSendInvite} className="rounded-xl shadow-lg shadow-primary/20">啟動招募</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
