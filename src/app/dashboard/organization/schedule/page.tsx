"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MapPin, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Trash2,
  Terminal,
  Filter,
  MoreHorizontal
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
import { WorkspaceStatus } from "@/types/domain";

/**
 * SchedulePage - 職責：維度層級的排班治理 (Orchestra 強化版)
 * 1. 每一格日期顯示所有工作區。
 * 2. 實施狀態過濾 (籌備/啟動/停止)。
 * 3. 對齊 Orchestra-new 視覺美學。
 */
export default function SchedulePage() {
  const { activeOrgId, organizations, workspaces } = useAppStore();
  const { db } = useFirebase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignTargetWs, setAssignTargetWs] = useState<string | null>(null);

  // 治理狀態過濾器
  const [activeFilters, setActiveStatuses] = useState<Set<WorkspaceStatus>>(
    new Set(['preparatory', 'active', 'stopped'])
  );

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId),
    [organizations, activeOrgId]
  );

  // 效能優化：過濾後的空間清單
  const filteredWorkspaces = useMemo(() => {
    return (workspaces || [])
      .filter(w => w.orgId === activeOrgId)
      .filter(w => activeFilters.has(w.status || 'active'))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [workspaces, activeOrgId, activeFilters]);

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

  const toggleFilter = (status: WorkspaceStatus) => {
    const next = new Set(activeFilters);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    setActiveStatuses(next);
  };

  const handleAssign = async (member: any, workspaceId: string, workspaceName: string) => {
    if (!selectedDay || !activeOrgId) return;
    const dateStr = format(selectedDay, "yyyy-MM-dd");
    
    const newAssignment = {
      memberId: member.id,
      memberName: member.name,
      locationId: workspaceId,
      locationName: workspaceName,
      date: dateStr,
      state: 'draft'
    };

    await addDoc(collection(db, "organizations", activeOrgId, "schedules"), newAssignment);
    toast({ title: "作業草稿已建立", description: `已分配 ${member.name} 至 ${workspaceName}` });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'preparatory': return 'bg-amber-500';
      case 'stopped': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="作業排班治理" 
        description="管理維度下各個空間節點的資源分配。對齊「空間主權」與「人力脈動」。"
      >
        <div className="flex items-center gap-3 mr-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-full"><ChevronLeft /></Button>
          <h2 className="text-xl font-bold font-headline min-w-[160px] text-center tracking-tight">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-full"><ChevronRight /></Button>
        </div>
        <Button onClick={handlePublish} className="gap-2 font-bold uppercase text-[10px] shadow-xl shadow-primary/20 px-6 rounded-full">
          <Send className="w-3.5 h-3.5" /> 發佈同步
        </Button>
      </PageHeader>

      {/* 高價值過濾控制列 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-[2rem] border border-border/60 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 rounded-full border border-border/40">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">空間狀態過濾</span>
          </div>
          <div className="flex items-center gap-4">
            {(['preparatory', 'active', 'stopped'] as WorkspaceStatus[]).map((s) => (
              <div key={s} className="flex items-center space-x-2 group cursor-pointer" onClick={() => toggleFilter(s)}>
                <Checkbox id={`filter-${s}`} checked={activeFilters.has(s)} />
                <Label htmlFor={`filter-${s}`} className="text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1.5 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(s))} />
                  {s === 'active' ? '啟動中' : s === 'preparatory' ? '籌備中' : '已停止'}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">草稿狀態</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">正式共振</span>
          </div>
        </div>
      </div>

      {/* 排班日曆本體 */}
      <div className="grid grid-cols-7 gap-px bg-border/40 overflow-hidden rounded-[2.5rem] border border-border/60 shadow-inner">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="bg-muted/30 p-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">{d}</div>
        ))}
        
        {Array.from({ length: getDay(monthStart) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card/10 min-h-[240px]" />
        ))}

        {days.map(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayAssignments = assignments?.filter(a => a.date === dateStr) || [];
          
          return (
            <div 
              key={dateStr} 
              className={cn(
                "bg-card min-h-[240px] p-2 border-t border-l transition-all group relative flex flex-col",
                isToday(day) && "bg-primary/[0.03]"
              )}
            >
              <div className="flex justify-between items-center mb-3 px-1">
                <span className={cn(
                  "text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                  isToday(day) ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted-foreground group-hover:text-primary"
                )}>
                  {format(day, "d")}
                </span>
                <Badge variant="ghost" className="text-[8px] font-bold opacity-30">{dayAssignments.length} Assignments</Badge>
              </div>

              {/* 日期格子內的空間清單 */}
              <ScrollArea className="flex-1 -mx-1 px-1">
                <div className="space-y-3 pb-2">
                  {filteredWorkspaces.map(ws => {
                    const wsAssignments = dayAssignments.filter(a => a.locationId === ws.id);
                    return (
                      <div key={ws.id} className="space-y-1">
                        <div className="flex items-center justify-between group/ws px-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <div className={cn("w-1 h-1 rounded-full", getStatusColor(ws.status))} />
                            <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground truncate opacity-60 group-hover/ws:opacity-100 transition-opacity">
                              {ws.name}
                            </span>
                          </div>
                          <button 
                            onClick={() => { setSelectedDay(day); setAssignTargetWs(ws.id); setIsAssignOpen(true); }}
                            className="opacity-0 group-hover/ws:opacity-100 hover:text-primary transition-all"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {wsAssignments.map((a: any) => (
                            <div 
                              key={a.id} 
                              className={cn(
                                "group/item relative h-7 w-7 rounded-lg border transition-all flex items-center justify-center",
                                a.state === 'draft' ? "bg-amber-500/5 border-amber-500/30 text-amber-700" : "bg-primary border-primary text-white shadow-sm"
                              )}
                              title={`${a.memberName} @ ${ws.name}`}
                            >
                              <span className="text-[10px] font-black">{a.memberName[0]}</span>
                              <button 
                                onClick={() => handleDelete(a.id)} 
                                className="absolute -top-1 -right-1 bg-background border rounded-full p-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm"
                              >
                                <Trash2 className="w-2 h-2 text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>

      {/* 分派對話框 */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl flex items-center gap-3">
                <Clock className="w-8 h-8" /> 成員分派中心
              </DialogTitle>
              <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-[10px] mt-2">
                {selectedDay ? format(selectedDay, "yyyy-MM-dd") : ""} · 指派至: {workspaces.find(w => w.id === assignTargetWs)?.name}
              </p>
            </DialogHeader>
          </div>
          
          <div className="p-8">
            <ScrollArea className="h-[450px] pr-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 內部團隊 */}
                <div className="col-span-full border-b pb-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">維度內部成員</span>
                </div>
                {activeOrg?.members?.filter(m => !m.isExternal).map((m: any) => (
                  <MemberItem 
                    key={m.id} 
                    member={m} 
                    onClick={() => handleAssign(m, assignTargetWs!, workspaces.find(w => w.id === assignTargetWs)?.name || "")} 
                  />
                ))}
                
                {/* 外部夥伴 */}
                <div className="col-span-full border-b pb-2 mb-2 mt-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">外部合作夥伴</span>
                </div>
                {activeOrg?.members?.filter(m => m.isExternal).map((m: any) => (
                  <MemberItem 
                    key={m.id} 
                    member={m} 
                    isExternal 
                    onClick={() => handleAssign(m, assignTargetWs!, workspaces.find(w => w.id === assignTargetWs)?.name || "")} 
                  />
                ))}
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
      className="justify-start h-16 rounded-2xl border-border/60 hover:border-primary/40 hover:bg-primary/[0.02] group transition-all p-3"
      onClick={onClick}
    >
      <Avatar className="w-10 h-10 border-2 border-background shadow-sm mr-3">
        <AvatarFallback className={cn("text-xs font-bold", isExternal ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary")}>
          {member.name[0]}
        </AvatarFallback>
      </Avatar>
      <div className="text-left flex-1 truncate">
        <p className="text-xs font-black truncate">{member.name}</p>
        <Badge variant="outline" className="text-[7px] h-3.5 border-muted-foreground/30 font-black px-1 mt-0.5">
          {isExternal ? 'PARTNER' : member.role}
        </Badge>
      </div>
    </Button>
  );
}