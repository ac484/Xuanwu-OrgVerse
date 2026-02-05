"use client";

import { useAppStore } from "@/lib/store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Command, Check, Trash2, Users, Layers, Globe, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef, useMemo, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

/**
 * DashboardHeader - 職責：處理導航欄的全域搜尋與通知邏輯
 * 極致效能：引入 useDeferredValue 處理搜尋，並使用精準選擇器減少渲染次數。
 */
export function DashboardHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 精準選擇器模式：僅訂閱必要狀態，避免無謂渲染
  const organizations = useAppStore(state => state.organizations);
  const activeOrgId = useAppStore(state => state.activeOrgId);
  const workspaces = useAppStore(state => state.workspaces);
  const notifications = useAppStore(state => state.notifications);
  const setActiveOrg = useAppStore(state => state.setActiveOrg);
  const markAsRead = useAppStore(state => state.markAsRead);
  const clearNotifications = useAppStore(state => state.clearNotifications);
  
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId),
    [organizations, activeOrgId]
  );
  
  // 效能優化：基於延遲值的非阻塞搜尋
  const filteredResults = useMemo(() => {
    if (!deferredQuery.trim()) return { organizations: [], workspaces: [], members: [] };
    
    const query = deferredQuery.toLowerCase();
    return {
      organizations: organizations.filter(o => 
        o.name.toLowerCase().includes(query)
      ).slice(0, 3),
      workspaces: (workspaces || []).filter(w => 
        w.orgId === activeOrgId && 
        w.visibility === 'visible' && 
        w.name.toLowerCase().includes(query)
      ).slice(0, 3),
      members: (activeOrg?.members || []).filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query)
      ).slice(0, 3)
    };
  }, [deferredQuery, organizations, workspaces, activeOrgId, activeOrg?.members]);

  const hasResults = deferredQuery.length > 0 && (
    filteredResults.organizations.length > 0 ||
    filteredResults.workspaces.length > 0 ||
    filteredResults.members.length > 0
  );

  const handleResultClick = (type: 'org' | 'ws' | 'member', id: string) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    
    switch (type) {
      case 'org':
        setActiveOrg(id);
        router.push('/dashboard');
        break;
      case 'ws':
        router.push(`/dashboard/workspaces/${id}`);
        break;
      case 'member':
        router.push('/dashboard/organization/members');
        break;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/60 backdrop-blur-md px-6">
      <SidebarTrigger />
      <div className="flex-1 flex items-center justify-center">
        <div ref={searchRef} className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            id="global-search-input"
            placeholder="搜尋維度、空間或人員..." 
            className="pl-10 pr-10 bg-muted/40 border-none h-9 focus-visible:ring-1 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-0.5 hover:bg-muted rounded-full">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            <div className="hidden md:flex items-center gap-1 text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 bg-background shadow-sm ml-1">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>
          
          {isSearchOpen && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-card border rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <ScrollArea className="max-h-[400px]">
                {hasResults ? (
                  <div className="space-y-4 p-2">
                    {filteredResults.organizations.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">維度</div>
                        {filteredResults.organizations.map(org => (
                          <div 
                            key={org.id} 
                            onClick={() => handleResultClick('org', org.id)}
                            className="flex items-center justify-between p-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <Globe className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">{org.name}</span>
                            </div>
                            {activeOrgId === org.id && <Badge variant="outline" className="text-[8px] h-4">當前</Badge>}
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredResults.workspaces.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">空間</div>
                        {filteredResults.workspaces.map(ws => (
                          <div 
                            key={ws.id} 
                            onClick={() => handleResultClick('ws', ws.id)}
                            className="flex items-center gap-3 p-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors"
                          >
                            <Layers className="w-4 h-4 text-primary" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{ws.name}</span>
                              <span className="text-[9px] text-muted-foreground font-mono">{ws.id.toUpperCase()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredResults.members.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">人員</div>
                        {filteredResults.members.map(member => (
                          <div 
                            key={member.id} 
                            onClick={() => handleResultClick('member', member.id)}
                            className="flex items-center gap-3 p-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors"
                          >
                            <User className="w-4 h-4 text-primary" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{member.name}</span>
                              <span className="text-[9px] text-muted-foreground">{member.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-xs italic">
                    找不到相關結果。
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 hover:bg-accent rounded-full transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b flex items-center justify-between">
              <h4 className="font-bold text-sm uppercase tracking-widest">維度脈動</h4>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearNotifications}>
                <Trash2 className="h-3 w-3" />
              </Button>
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
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}