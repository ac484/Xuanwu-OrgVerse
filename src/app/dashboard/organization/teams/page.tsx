"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, FolderTree, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
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

/**
 * OrganizationTeamsPage - 職責：管理維度內的部門團隊 (Team 清單)
 */
export default function OrganizationTeamsPage() {
  const { organizations, activeOrgId, addOrgTeam } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  if (!activeOrg) return null;

  // 防禦性檢查：確保 teams 存在
  const teams = activeOrg.teams || [];

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    addOrgTeam(activeOrg.id, {
      name: newTeamName,
      description: "自定義的維度技術或業務團隊。"
    });
    setNewTeamName("");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="部門團隊" 
        description="管理組織內部的邏輯分組，如技術部、行銷部等。"
      >
        <Button className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> 建立團隊
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="border-border/60 hover:border-primary/40 transition-all cursor-pointer group" onClick={() => router.push(`/dashboard/organization/teams/${team.id}`)}>
            <CardHeader>
              <div className="p-2.5 w-fit bg-primary/5 rounded-xl text-primary mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Users className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-headline">{team.name}</CardTitle>
              <CardDescription className="text-xs">{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {(team.memberIds || []).length} 名成員
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="border-t py-4 flex justify-between items-center bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground">ID: {team.id.toUpperCase()}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-[9px] font-bold uppercase tracking-widest text-primary">
                管理成員 <ArrowRight className="w-3 h-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <div 
          className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40 hover:bg-muted/10 transition-colors cursor-pointer"
          onClick={() => setIsCreateOpen(true)}
        >
          <FolderTree className="w-8 h-8 text-muted-foreground mb-4 opacity-20" />
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">建立新團隊</p>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">建立團隊</DialogTitle>
            <DialogDescription>定義一個新的組織子單元，用於聚合特定成員。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>團隊名稱</Label>
              <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="例如: 雲端技術架構組" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreateTeam}>確認建立</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
