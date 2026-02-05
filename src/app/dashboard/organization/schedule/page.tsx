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
  Trash2
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isSameMonth, 
  isToday,
  addMonths,
  subMonths
} from "date-fns";
import { useFirebase } from "@/firebase/provider";
import { collection, query, addDoc, updateDoc, deleteDoc, doc, writeBatch, serverTimestamp } from "firebase/firestore";
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

/**
 * SchedulePage - 職責：維度層級的排班治理
 * 採用 Orchestra 的草稿/發佈雙軌邏輯。
 */
export default function SchedulePage() {
  const { activeOrgId, organizations } = useAppStore();
  const { db } = useFirebase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId),
    [organizations, activeOrgId]
  );

  // 實時獲取地點
  const locQuery = useMemo(() => {
    if (!activeOrgId || !db) return null;
    return query(collection(db, "organizations", activeOrgId, "locations"));
  }, [activeOrgId, db]);
  const { data: locations } = useCollection<any>(locQuery);

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

  const handleAddLocation = async () => {
    const name = prompt("輸入新作業地點名稱:");
    if (!name || !activeOrgId) return;
    await addDoc(collection(db, "organizations", activeOrgId, "locations"), { name });
    toast({ title: "地點已建立" });
  };

  const handleAssign = async (member: any, locationId: string, locationName: string) => {
    if (!selectedDay || !activeOrgId) return;
    const dateStr = format(selectedDay, "yyyy-MM-dd");
    
    await addDoc(collection(db, "organizations", activeOrgId, "schedules"), {
      memberId: member.id,
      memberName: member.name,
      locationId,
      locationName,
      date: dateStr,
      state: 'draft'
    });
    
    toast({ title: "草稿已添加", description: `已將 ${member.name} 分配至 ${locationName}` });
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
    toast({ title: "排班已正式發佈", description: "所有草稿已同步至全域時間線。" });
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!activeOrgId) return;
    await deleteDoc(doc(db, "organizations", activeOrgId, "schedules", id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="排班治理中心" 
        description="管理維度下的作業地點分配。採用「草稿-發佈」雙軌制確保作業穩定性。"
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAddLocation} className="gap-2 font-bold uppercase text-[10px]">
            <MapPin className="w-3.5 h-3.5" /> 新增地點
          </Button>
          <Button size="sm" onClick={handlePublish} className="gap-2 font-bold uppercase text-[10px] bg-primary shadow-lg shadow-primary/20">
            <Send className="w-3.5 h-3.5" /> 發佈同步
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/60">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft /></Button>
          <h2 className="text-xl font-bold font-headline min-w-[160px] text-center">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight /></Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">草稿</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">正式</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border overflow-hidden rounded-3xl border border-border/60">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="bg-muted/50 p-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{d}</div>
        ))}
        
        {Array.from({ length: getDay(monthStart) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card/30 min-h-[120px]" />
        ))}

        {days.map(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayAssignments = assignments?.filter(a => a.date === dateStr) || [];
          
          return (
            <div 
              key={dateStr} 
              className={cn(
                "bg-card min-h-[140px] p-2 border-t border-l transition-colors hover:bg-muted/10 cursor-pointer group",
                isToday(day) && "bg-primary/5"
              )}
              onClick={() => { setSelectedDay(day); setIsAssignOpen(true); }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                  isToday(day) ? "bg-primary text-white" : "text-muted-foreground"
                )}>
                  {format(day, "d")}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><Plus className="w-3 h-3" /></Button>
              </div>
              <div className="space-y-1">
                {dayAssignments.map((a: any) => (
                  <div 
                    key={a.id} 
                    className={cn(
                      "text-[9px] p-1 rounded border flex items-center justify-between",
                      a.state === 'draft' ? "bg-amber-500/10 border-amber-500/30 text-amber-700" : "bg-primary text-white"
                    )}
                  >
                    <span className="truncate">{a.memberName} @ {a.locationName}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteAssignment(a.id); }}>
                      <Trash2 className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" /> 分配成員
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {selectedDay ? format(selectedDay, "yyyy-MM-dd") : ""} · 建立作業草稿
            </p>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6 py-4">
              {locations?.length > 0 ? locations.map((loc: any) => (
                <div key={loc.id} className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <MapPin className="w-3 h-3" /> {loc.name}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {activeOrg?.members?.map((m: any) => (
                      <Button 
                        key={m.id} 
                        variant="outline" 
                        className="justify-start h-12 rounded-xl border-border/60 hover:bg-primary/5 hover:border-primary/40 group"
                        onClick={() => handleAssign(m, loc.id, loc.name)}
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold mr-3 group-hover:bg-primary group-hover:text-white transition-colors">
                          {m.name[0]}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold">{m.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase">{m.role}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 opacity-30">
                  <MapPin className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase">請先新增作業地點</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)} className="rounded-xl">取消</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
