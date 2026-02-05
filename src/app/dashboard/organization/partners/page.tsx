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
  SendHorizontal,
  FolderPlus,
  Users
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
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PartnersPage() {
  const { organizations, activeOrgId } = useAppStore();
  const { db } = useFirebase();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteInviteEmail] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("未分類組");

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId),
    [organizations, activeOrgId]
  );

  const invitesQuery = useMemo(() => {
    if (!activeOrgId || !db) return null;
    return query(
      collection(db, "organizations", activeOrgId, "invites"),
      orderBy("invitedAt", "desc")
    );
  }, [activeOrgId, db]);

  const { data: invites } = useCollection<any>(invitesQuery);

  const externalMembers = useMemo(() => 
    (activeOrg?.members || []).filter(m => m.isExternal || m.role === 'Guest'),
    [activeOrg?.members]
  );

  const handleSendInvite = () => {
    if (!inviteEmail.trim() || !activeOrgId) return;

    const inviteData = {
      email: inviteEmail,
      status: 'pending',
      role: 'Guest',
      group: selectedGroup,
      invitedAt: serverTimestamp(),
      protocol: 'Standard Bridge'
    };

    addDoc(collection(db, "organizations", activeOrgId, "invites"), inviteData)
      .then(() => {
        setInviteInviteEmail("");
        setIsInviteOpen(false);
        toast({ title: "招募邀請已發送", description: `${inviteEmail} 將收到共振請求。` });
      });
  };

  const handleUpdateGroup = (memberId: string, groupName: string) => {
    if (!activeOrg) return;
    const updatedMembers = activeOrg.members.map(m => 
      m.id === memberId ? { ...m, group: groupName } : m
    );
    updateDoc(doc(db, "organizations", activeOrg.id), { members: updatedMembers })
      .then(() => toast({ title: "群組共振成功", description: `已將夥伴分配至 ${groupName}` }));
  };

  if (!activeOrg) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="合作夥伴治理" 
        description="管理跨維度的外部招募。透過分組 (Group) 實現外部身分的有序共振。"
      >
        <Button className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10 px-6 shadow-lg shadow-primary/20" onClick={() => setIsInviteOpen(true)}>
          <MailPlus className="w-4 h-4" /> 招募夥伴
        </Button>
      </PageHeader>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl">
          <TabsTrigger value="active" className="text-xs font-bold uppercase tracking-widest px-6 text-primary">已共振夥伴 ({externalMembers.length})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs font-bold uppercase tracking-widest px-6">待處理邀請 ({(invites || []).filter(i => i.status === 'pending').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {externalMembers.map((member) => (
              <Card key={member.id} className="border-border/60 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-all group overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                      {member.name?.[0] || 'P'}
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-primary border-primary/20">
                      {member.group || '未分類組'}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold truncate">{member.name}</CardTitle>
                  <CardDescription className="text-[10px] font-mono opacity-60">{member.email}</CardDescription>
                </CardHeader>
                <CardFooter className="border-t border-border/10 py-3 flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 text-[9px] font-bold uppercase gap-1.5 flex-1" onClick={() => {
                    const newGroup = prompt("輸入新的群組名稱:", member.group || "");
                    if (newGroup) handleUpdateGroup(member.id, newGroup);
                  }}>
                    <FolderPlus className="w-3 h-3" /> 修改分組
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><XCircle className="w-4 h-4" /></Button>
                </CardFooter>
              </Card>
            ))}
            {externalMembers.length === 0 && (
              <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl opacity-20">
                <Handshake className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">目前尚無已共振的夥伴</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(invites || []).filter(i => i.status === 'pending').map((invite) => (
              <Card key={invite.id} className="border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden opacity-70">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary">
                      <Clock className="w-4 h-4" />
                    </div>
                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest">等待回覆</Badge>
                  </div>
                  <CardTitle className="text-sm font-bold truncate">{invite.email}</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-mono">預計分組: {invite.group}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
            <div className="space-y-2">
              <Label>初始分組 (Group)</Label>
              <Input 
                value={selectedGroup} 
                onChange={(e) => setSelectedGroup(e.target.value)} 
                placeholder="例如: 外部審核組" 
                className="rounded-xl h-11"
              />
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
