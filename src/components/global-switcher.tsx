
"use client";

import { useAppStore } from "@/lib/store";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Check, 
  ChevronsUpDown, 
  User, 
  Users, 
  ExternalLink 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export function GlobalSwitcher() {
  const { organizations, activeOrgId, setActiveOrg, user } = useAppStore();
  const { db } = useFirebase();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  const handleCreateOrg = () => {
    if (!newOrgName.trim() || !user) return;
    
    const orgData = {
      name: newOrgName,
      description: newOrgDescription || "General dimension profile",
      ownerId: user.id,
      role: "Owner",
      createdAt: serverTimestamp(),
      members: [{ id: user.id, name: user.name, email: user.email, role: 'Owner', status: 'active' }]
    };

    // 遵循規範：不使用 await，鏈接 .catch() 以捕捉權限錯誤
    addDoc(collection(db, "organizations"), orgData)
      .then(() => {
        setNewOrgName("");
        setNewOrgDescription("");
        setIsCreateOpen(false);
        toast({
          title: "新維度已建立",
          description: `${newOrgName} 現已同步至雲端環境。`,
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'organizations',
          operation: 'create',
          requestResourceData: orgData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between shadow-sm border-border/60 hover:bg-accent/10">
            <div className="flex items-center gap-2 truncate">
              {activeOrg?.id === 'personal' ? (
                <User className="w-4 h-4 text-primary" />
              ) : activeOrg?.isExternal ? (
                <ExternalLink className="w-4 h-4 text-accent" />
              ) : (
                <Users className="w-4 h-4 text-primary" />
              )}
              <span className="truncate font-semibold">{activeOrg?.name || "選取維度"}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]" align="start">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-widest font-bold px-2 py-1.5">
            可選維度
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem 
              key={org.id} 
              onSelect={() => setActiveOrg(org.id)}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-md",
                  org.id === 'personal' ? "bg-primary/10" : org.isExternal ? "bg-accent/10" : "bg-primary/5"
                )}>
                  {org.id === 'personal' ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : org.isExternal ? (
                    <ExternalLink className="w-4 h-4 text-accent" />
                  ) : (
                    <Users className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{org.name}</span>
                  <span className="text-[10px] text-muted-foreground">{org.role}</span>
                </div>
              </div>
              {activeOrgId === org.id && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer py-2 text-primary focus:text-primary font-medium"
            onSelect={(e) => {
              e.preventDefault();
              setIsCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            建立新維度
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">建立新維度</DialogTitle>
            <DialogDescription>
              定義新的資源邊界與識別特質。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">維度名稱</Label>
              <Input 
                id="org-name" 
                value={newOrgName} 
                onChange={(e) => setNewOrgName(e.target.value)} 
                placeholder="例如: 亞特蘭提斯研究中心" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-desc">維度識別描述</Label>
              <Input 
                id="org-desc" 
                value={newOrgDescription} 
                onChange={(e) => setNewOrgDescription(e.target.value)} 
                placeholder="例如: 專注於高科技研發的實驗室" 
              />
              <p className="text-[10px] text-muted-foreground">這將幫助 AI 自動適配環境色彩共振。</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreateOrg}>啟動建立</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
