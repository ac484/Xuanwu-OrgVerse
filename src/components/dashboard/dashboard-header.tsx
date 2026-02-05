"use client";

import { useAppStore } from "@/lib/store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Command, Check, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * DashboardHeader - 職責：處理導航欄的搜尋與通知邏輯
 * 語義已優化為「邏輯空間 (Workspace)」。
 */
export function DashboardHeader() {
  const { notifications, markAsRead, clearNotifications } = useAppStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/60 backdrop-blur-md px-6">
      <SidebarTrigger />
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="存取邏輯空間 (Workspaces)..." 
            className="pl-10 pr-10 bg-muted/40 border-none h-9 focus-visible:ring-1"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 bg-background shadow-sm">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 hover:bg-accent rounded-full transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-background" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b flex items-center justify-between">
              <h4 className="font-bold text-sm uppercase tracking-widest">維度脈動</h4>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearNotifications}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-72">
              <div className="divide-y">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className={`p-4 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-xs font-bold leading-none flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${n.type === 'success' ? 'bg-green-500' : n.type === 'alert' ? 'bg-red-500' : 'bg-primary'}`} />
                          {n.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{n.message}</p>
                        <p className="text-[9px] text-muted-foreground/60">{new Date(n.timestamp).toLocaleTimeString()}</p>
                      </div>
                      {!n.read && (
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => markAsRead(n.id)}>
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground text-xs italic">
                    尚未偵測到活動共振。
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest">
                查看維度歷史紀錄
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
