"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MapPin, 
  Users, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Trash2,
  Terminal,
  UserCheck,
  Handshake,
  ShieldCheck
} from "lucide-react";
import { useState, useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isToday,
  addMonths,
  subMonths
} from "date-fns";
import { useFirebase } from "@/firebase/provider";
import { collection, query, addDoc, doc, writeBatch, deleteDoc } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * SchedulePage - 職責：維度層級的排班治理 (Orchestra 強化版)
 * 1. 地點對齊至工作區 (Workspaces)
 * 2. 成員分類展示 (Teams & Partners)
 */
export default function SchedulePage() {
  const { activeOrgId, organizations, workspaces } = useAppStore();
  const { db } = useFirebase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId),
    [organizations, activeOrgId]
  );

  const orgWorkspaces = useMemo(() => 
    (workspaces || []).filter(w => w.orgId === activeOrgId),
    [workspaces, activeOrgId]
  );

  // 實時獲取排班
  const schQuery = useMemo(() => {
    if (!activeOrgId || !db) return null;
    return query(collection(db, "organizations", activeOrgId, "schedules"));
  }, [activeOrgId, db]);
  const { data: assignments } = useCollection<any>(schQuery);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleAssign = async (member: any, workspace: any) => {
    if (!selectedDay || !activeOrgId) return;
    const dateStr = format(selectedDay, "yyyy-MM-dd");
    
    const newAssignment = {
      memberId: member.id,
      memberName: member.name,
      locationId: workspace.id,
      locationName: workspace.name,
      date: dateStr,
      state: 'draft'
    };

    await addDoc(collection(db, "organizations", activeOrgId, "schedules"), newAssignment);
    toast({ title: "作業草稿已建立", description: `已分配 ${member.name} 至 ${workspace.name}` });
    setIsAssignOpen(false);
  };

  const handlePublish = async () => {
    if (!activeOrgId || !assignments) return;
    const drafts = assignments.filter(a => a.state === 'draft');
    if (drafts.length === 0) {
      toast({ title: "無待發佈草稿" });
      return;
    }

    const batch = writeBatch(db);
    drafts.forEach(d => {
      const ref = doc(db, "organizations", activeOrgId, "schedules", d.id);
      batch.update(ref, { state: 'published' });
    });

    await batch.commit();
    toast({ title: "維度排班正式發佈", description: "所有草稿已完成全域共振。" });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "organizations", activeOrgId!, "schedules", id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="作業排班治理" 
        description="管理維度下各個工作區的資源分配。對齊「空間」與「人員」的數位脈動。"
      >
        <Button onClick={handlePublish} className="gap-2 font-bold uppercase text-[10px] shadow-xl shadow-primary/20">
          <Send className="w-3.5 h-3.5" /> 發佈同步
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm p-4 rounded-3xl border border-border/60 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-full"><ChevronLeft /></Button>
          <h2 className="text-xl font-bold font-headline min-w-[180px] text-center tracking-tight">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-full"><ChevronRight /></Button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">草稿狀態</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">正式共振</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border/40 overflow-hidden rounded-[2rem] border border-border/60 shadow-inner">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="bg-muted/30 p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{d}</div>
        ))}
        
        {Array.from({ length: getDay(monthStart) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card/10 min-h-[160px]" />
        ))}

        {days.map(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayAssignments = assignments?.filter(a => a.date === dateStr) || [];
          
          return (
            <div 
              key={dateStr} 
              className={cn(
                "bg-card min-h-[180px] p-2 border-t border-l transition-all hover:bg-primary/[0.02] cursor-pointer group relative",
                isToday(day) && "bg-primary/[0.04]"
              )}
              onClick={() => { setSelectedDay(day); setIsAssignOpen(true); }}
            >
              <div className="flex justify-between items-center mb-3 px-1">
                <span className={cn(
                  "text-xs font-black w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                  isToday(day) ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted-foreground group-hover:text-primary"
                )}>
                  {format(day, "d")}
                </span>
                <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="space-y-1.5">
                {dayAssignments.map((a: any) => (
                  <div 
                    key={a.id} 
                    className={cn(
                      "text-[9px] p-2 rounded-xl border flex items-center justify-between group/item transition-all",
                      a.state === 'draft' ? "bg-amber-500/5 border-amber-500/20 text-amber-700 italic" : "bg-primary text-white shadow-sm font-bold"
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <div className={cn("w-1 h-1 rounded-full", a.state === 'draft' ? "bg-amber-500" : "bg-white")} />
                      <span className="truncate">{a.memberName} @ {a.locationName}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl flex items-center gap-3">
                <Clock className="w-8 h-8" /> 成員分派中心
              </DialogTitle>
              <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-[10px] mt-2">
                {selectedDay ? format(selectedDay, "yyyy-MM-dd") : ""} · 建立空間共振草稿
              </p>
            </DialogHeader>
          </div>
          
          <div className="p-8">
            <ScrollArea className="h-[450px] pr-6">
              <div className="space-y-10">
                {orgWorkspaces.map((ws) => (
                  <div key={ws.id} className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                      <Terminal className="w-4 h-4 text-primary" />
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">工作區: {ws.name}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* 分類：內部團隊 */}
                      {activeOrg?.members?.filter(m => !m.isExternal).map((m: any) => (
                        <MemberItem key={m.id} member={m} onClick={() => handleAssign(m, ws)} />
                      ))}
                      {/* 分類：外部夥伴 */}
                      {activeOrg?.members?.filter(m => m.isExternal).map((m: any) => (
                        <MemberItem key={m.id} member={m} isExternal onClick={() => handleAssign(m, ws)} />
                      ))}
                    </div>
                  </div>
                ))}
                {orgWorkspaces.length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <MapPin className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">請先至維度空間建立工作區</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          <DialogFooter className="p-6 bg-muted/30 border-t">
            <Button variant="ghost" onClick={() => setIsAssignOpen(false)} className="rounded-2xl font-bold uppercase text-[10px] tracking-widest">取消操作</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberItem({ member, isExternal, onClick }: { member: any, isExternal?: boolean, onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      className="justify-start h-16 rounded-[1.25rem] border-border/60 hover:border-primary/40 hover:bg-primary/[0.02] group transition-all p-3"
      onClick={onClick}
    >
      <Avatar className="w-10 h-10 border-2 border-background shadow-sm mr-3 group-hover:scale-110 transition-transform">
        <AvatarFallback className={cn("text-xs font-bold", isExternal ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary")}>
          {member.name[0]}
        </AvatarFallback>
      </Avatar>
      <div className="text-left flex-1 truncate">
        <p className="text-xs font-black truncate">{member.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isExternal ? (
            <Badge variant="outline" className="text-[7px] h-3.5 border-accent/30 text-accent font-black px-1">
              {member.group || '外部夥伴'}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[7px] h-3.5 border-primary/30 text-primary font-black px-1">
              {member.role}
            </Badge>
          )}
        </div>
      </div>
    </Button>
  );
}
