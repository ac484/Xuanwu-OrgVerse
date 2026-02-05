
"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { useFirebase } from "@/firebase/provider";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export default function OrganizationMembersPage() {
  const [mounted, setMounted] = useState(false);
  const { organizations, activeOrgId } = useAppStore();
  const { db } = useFirebase();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOrg = useMemo(() => 
    (organizations || []).find(o => o.id === activeOrgId) || organizations[0],
    [organizations, activeOrgId]
  );

  if (!mounted || !activeOrg) return null;

  const members = activeOrg.members || [];

  const handleRecruitMember = () => {
    const newId = `m-${Math.random().toString(36).slice(-4)}`;
    const newMember = {
      id: newId,
      name: "新進研究員",
      email: `user-${newId}@orgverse.io`,
      role: 'Member',
      status: 'active'
    };

    const orgRef = doc(db, "organizations", activeOrg.id);
    updateDoc(orgRef, { members: arrayUnion(newMember) })
      .then(() => {
        toast({ title: "身分共振激活", description: "新的數位身分已成功同步至維度名單。" });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: orgRef.path,
          operation: 'update',
          requestResourceData: { members: 'arrayUnion' }
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  };

  const handleDismissMember = (member: any) => {
    const orgRef = doc(db, "organizations", activeOrg.id);
    updateDoc(orgRef, { members: arrayRemove(member) })
      .then(() => {
        toast({ title: "身分註銷", description: `成員 ${member.name} 已移除。`, variant: "destructive" });
      });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="維度成員名單" 
        description={`管理隸屬於 ${activeOrg.name} 的所有個人身分。`}
      >
        <Button className="flex items-center gap-2 font-bold uppercase text-[11px] tracking-widest h-10 px-6 shadow-lg shadow-primary/20" onClick={handleRecruitMember}>
          <UserPlus className="w-4 h-4" /> 招募新成員
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="border-border/60 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                  {member.name?.[0] || 'U'}
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                  <CardDescription className="text-[10px] font-mono opacity-60">{member.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 mt-2">
                <Badge variant="outline" className="text-[9px] uppercase font-bold bg-primary/5 px-2 py-0.5 border-primary/20 text-primary">
                  {member.role}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{member.status}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border/40">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest gap-2">
                  <Mail className="w-3 h-3" /> 聯繫
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDismissMember(member)}
                  disabled={member.role === 'Owner'}
                  className="h-8 hover:text-destructive hover:bg-destructive/5"
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
