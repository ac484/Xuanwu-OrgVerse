"use client";

import { useAppStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MailPlus, 
  Trash2, 
  Globe, 
  Clock, 
  UserCheck, 
  ShieldCheck,
  SendHorizontal
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp, query, orderBy, where, doc, updateDoc, arrayRemove } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * PartnerGroupDetailPage - 職責：特定夥伴群組內的成員招募與身份治理。
 */
export default function PartnerGroupDetailPage() {
  const { id } = useParams();
  const { organizations, activeOrgId } = useAppStore();
  const { db } = useFirebase();
  const [mounted, setMounted] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId) || organizations[0],
    [organizations, activeOrgId]
  );

  const group = useMemo(() => 
    activeOrg?.partnerGroups?.find(g => g.id === id),
    [activeOrg, id]
  );

  // 偵聽此群組的待處理邀請
  const invitesQuery = useMemo(() => {
    if (!activeOrgId || !db || !id) return null;
    return query(
      collection(db, "organizations", activeOrgId, "invites"),
      where("groupId", "==", id),
      orderBy("invitedAt", "desc")
    );
  }, [activeOrgId, db, id]);

  const { data: invites } = useCollection<any>(invitesQuery);

  if (!mounted || !group || !activeOrg) return null;

  const groupMembers = (activeOrg.members || []).filter(m => group.memberIds?.includes(m.id));

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;

    const inviteData = {
      email: inviteEmail,
      groupId: group.id,
      groupName: group.name,
      status: 'pending',
      role: 'Guest',
      invitedAt: serverTimestamp(),
      protocol: 'Standard Bridge'
    };

    addDoc(collection(db, "organizations", activeOrg.id, "invites"), inviteData)
      .then(() => {
        setInviteEmail("");
        setIsInviteOpen(false);
        toast({ title: "招募協議已發送", description: `${inviteEmail} 將收到共振請求。` });
      });
  };

  const handleDismissMember = (member: any) => {
    // 1. 從組織成員移除 (若是 Guest)
    const orgRef = doc(db, "organizations", activeOrg.id);
    const updatedMembers = activeOrg.members.filter(m => m.id !== member.id);
    
    // 2. 從群組 ID 陣列移除
    const updatedGroups = activeOrg.partnerGroups.map(g => 
      g.id === group.id ? { ...g, memberIds: g.memberIds.filter(mid => mid !== member.id) } : g
    );

    updateDoc(orgRef, { members: updatedMembers, partnerGroups: updatedGroups })
      .then(() => toast({ title: "夥伴關係中斷" }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 hover:bg-accent/5">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">夥伴治理 / {group.name}</span>
      </div>

      <PageHeader 
        title={group.name} 
        description={group.description}
      >
        <Button className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10 px-6 shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90" onClick={() => setIsInviteOpen(true)}>
          <MailPlus className="w-4 h-4" /> 招募新夥伴
        </Button>
      </PageHeader>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl">
          <TabsTrigger value="members" className="text-xs font-bold uppercase tracking-widest px-6 data-[state=active]:text-accent">已共振成員 ({groupMembers.length})</TabsTrigger>
          <TabsTrigger value="invites" className="text-xs font-bold uppercase tracking-widest px-6">待處理招募 ({(invites || []).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupMembers.map(member => (
              <Card key={member.id} className="border-border/60 bg-card/40 backdrop-blur-sm border-l-4 border-l-accent group">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold border border-accent/20">
                    {member.name?.[0] || 'P'}
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                    <CardDescription className="text-[10px] font-mono opacity-60">{member.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="border-t border-border/10 py-3 flex gap-2">
                  <Badge variant="outline" className="text-[9px] uppercase font-bold border-accent/30 text-accent bg-accent/5">
                    {member.accessProtocol || 'Standard Bridge'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleDismissMember(member)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {groupMembers.length === 0 && (
              <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-30">
                <Globe className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">此群組尚無已共振的夥伴身分</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(invites || []).map(invite => (
              <Card key={invite.id} className="border-border/60 bg-muted/5 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <Badge variant="secondary" className="text-[8px] font-black uppercase bg-amber-500/10 text-amber-600 border-none">Pending</Badge>
                </div>
                <CardHeader>
                  <div className="p-2 bg-background rounded-lg border w-fit mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />
                  </div>
                  <CardTitle className="text-sm font-bold truncate">{invite.email}</CardTitle>
                  <CardDescription className="text-[10px] font-mono">發送時間: {invite.invitedAt?.seconds ? new Date(invite.invitedAt.seconds * 1000).toLocaleDateString() : '同步中...'}</CardDescription>
                </CardHeader>
                <CardFooter className="border-t border-border/10 py-3">
                  <p className="text-[9px] text-muted-foreground italic">等待外部人員登入並接受協議...</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-accent p-8 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl flex items-center gap-3">
                <SendHorizontal className="w-8 h-8" /> 發送招募協議
              </DialogTitle>
              <DialogDescription className="text-accent-foreground/80 mt-2 font-medium">
                向外部人員發送暫時性數位共振邀請，並掛載至「{group.name}」。
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">夥伴聯絡端點 (Email)</Label>
              <Input 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)} 
                placeholder="partner@external-corp.io" 
                className="rounded-2xl h-12 border-muted-foreground/20 focus-visible:ring-accent/30"
              />
            </div>
            <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-accent mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-accent uppercase tracking-widest">安全性聲明</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  受邀者接受後將獲得「訪客 (Guest)」權限。所有操作將受限於隔離協議，且無法存取其他不相關的維度空間。
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/30 border-t">
            <Button variant="ghost" onClick={() => setIsInviteOpen(false)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest">取消</Button>
            <Button onClick={handleSendInvite} className="bg-accent hover:bg-accent/90 rounded-xl px-8 shadow-lg shadow-accent/20 font-bold uppercase text-[10px] tracking-widest">啟動招募協議</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}