"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, Plus, FolderTree, ArrowRight, Globe } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase/provider";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

/**
 * PartnersPage - 職責：管理外部合作夥伴的邏輯分組。
 * 遵循「群組優先」原則：先建立群組，再進入邀請。
 */
export default function PartnersPage() {
  const { organizations, activeOrgId } = useAppStore();
  const { db } = useFirebase();
  const [mounted, setMounted] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId) || organizations[0],
    [organizations, activeOrgId]
  );

  if (!mounted || !activeOrg) return null;

  const partnerGroups = activeOrg.partnerGroups || [];

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup = {
      id: `pg-${Math.random().toString(36).slice(-4)}`,
      name: newGroupName,
      description: "外部數位身分共振群組，用於管理跨維度合作夥伴。",
      memberIds: []
    };

    const orgRef = doc(db, "organizations", activeOrg.id);
    updateDoc(orgRef, { partnerGroups: arrayUnion(newGroup) })
      .then(() => {
        setNewGroupName("");
        setIsCreateOpen(false);
        toast({ title: "夥伴群組已建立" });
      });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="合作夥伴治理" 
        description="管理外部維度合作夥伴的邏輯分組。建立群組後即可發送招募邀請。"
      >
        <Button className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10 px-6 shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> 建立新夥伴組
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partnerGroups.map((group) => (
          <Card 
            key={group.id} 
            className="border-border/60 hover:border-accent/40 transition-all cursor-pointer group bg-card/40 backdrop-blur-sm shadow-sm" 
            onClick={() => router.push(`/dashboard/organization/partners/${group.id}`)}
          >
            <CardHeader className="pb-4">
              <div className="p-2.5 w-fit bg-accent/5 rounded-xl text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <Globe className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-headline group-hover:text-accent transition-colors">{group.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-[10px] font-bold bg-accent/10 text-accent border-none px-2">
                {(group.memberIds || []).length} 位已共振夥伴
              </Badge>
            </CardContent>
            <CardFooter className="border-t border-border/10 py-4 flex justify-between items-center bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground">GID: {group.id.toUpperCase()}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[9px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5">
                管理與招募 <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <div 
          className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40 hover:bg-accent/5 hover:border-accent/20 transition-all cursor-pointer group min-h-[240px]"
          onClick={() => setIsCreateOpen(true)}
        >
          <div className="p-4 rounded-full bg-muted/10 group-hover:bg-accent/10 transition-colors">
            <Handshake className="w-10 h-10 text-muted-foreground group-hover:text-accent transition-colors opacity-30" />
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-4">建立新的合作邊界</p>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">建立夥伴群組</DialogTitle>
            <DialogDescription>定義一個新的外部合作單元，用於聚合特定任務的合作夥伴。</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest">群組名稱</Label>
              <Input 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)} 
                placeholder="例如: 核心架構顧問組" 
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">取消</Button>
            <Button onClick={handleCreateGroup} className="bg-accent hover:bg-accent/90 rounded-xl px-8 shadow-lg shadow-accent/20">啟動群組</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}