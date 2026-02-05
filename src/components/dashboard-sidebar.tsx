"use client";

import { useAppStore } from "@/lib/store";
import { 
  LayoutDashboard, 
  Layers, 
  LogOut,
  Terminal,
  ChevronUp,
  Fingerprint,
  UserCircle,
  FolderTree,
  ChevronRight,
  Activity,
  Grid3X3,
  GlobeLock,
  Users,
  Settings2,
  Box,
  Handshake,
  History,
  MessageSquare,
  CalendarDays,
  Globe
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "@/components/ui/sidebar";
import { GlobalSwitcher } from "@/components/global-switcher";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useMemo } from "react";

/**
 * DashboardSidebar - 職責：全站導航與空間快速切換
 * 術語校準：統一使用單數「organization」路徑。
 */
export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const user = useAppStore(state => state.user);
  const activeOrgId = useAppStore(state => state.activeOrgId);
  const organizations = useAppStore(state => state.organizations);
  const workspaces = useAppStore(state => state.workspaces);
  const logout = useAppStore(state => state.logout);
  
  const activeOrg = useMemo(() => 
    organizations.find(o => o.id === activeOrgId),
    [organizations, activeOrgId]
  );

  const orgWorkspaces = useMemo(() => {
    if (!activeOrg || !user) return [];
    return (workspaces || []).filter(w => w.orgId === activeOrgId && w.visibility === 'visible');
  }, [workspaces, activeOrgId, activeOrg, user]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 mb-4 px-1 hover:opacity-80 transition-opacity">
          <div className="p-1.5 bg-primary rounded-lg shadow-sm">
            <Fingerprint className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-headline tracking-tight italic">OrgVerse</span>
        </Link>
        <GlobalSwitcher />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 px-3">控制中心</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="font-semibold">維度總覽</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <FolderTree className="w-4 h-4" />
                      <span className="font-semibold">維度治理</span>
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/organization/members'}>
                          <Link href="/dashboard/organization/members" className="flex items-center gap-2">
                            <Users className="w-3 h-3" /> 成員名單
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/organization/teams')}>
                          <Link href="/dashboard/organization/teams" className="flex items-center gap-2">
                            <UserCircle className="w-3 h-3" /> 部門團隊
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/organization/partners')}>
                          <Link href="/dashboard/organization/partners" className="flex items-center gap-2">
                            <Globe className="w-3 h-3" /> 合作夥伴
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/organization/schedule'}>
                          <Link href="/dashboard/organization/schedule" className="flex items-center gap-2">
                            <CalendarDays className="w-3 h-3" /> 排班治理
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/organization/matrix'}>
                          <Link href="/dashboard/organization/matrix" className="flex items-center gap-2">
                            <Grid3X3 className="w-3 h-3" /> 權限共振
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/organization/daily'}>
                          <Link href="/dashboard/organization/daily" className="flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" /> 維度動態
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/organization/audit'}>
                          <Link href="/dashboard/organization/audit" className="flex items-center gap-2">
                            <History className="w-3 h-3" /> 維度脈動
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/organization/settings'}>
                          <Link href="/dashboard/organization/settings" className="flex items-center gap-2">
                            <Settings2 className="w-3 h-3" /> 維度設定
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/workspaces')}>
                  <Link href="/dashboard/workspaces" className="flex items-center gap-3">
                    <Layers className="w-4 h-4" />
                    <span className="font-semibold">維度空間</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-4 opacity-50" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">快速切換空間</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {orgWorkspaces.map((workspace) => (
                <SidebarMenuItem key={workspace.id}>
                  <SidebarMenuButton asChild isActive={pathname === `/dashboard/workspaces/${workspace.id}`}>
                    <Link href={`/dashboard/workspaces/${workspace.id}`} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 truncate">
                        <Terminal className="w-3 h-3 text-primary/60" />
                        <span className="truncate text-xs font-medium">{workspace.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase">{workspace.id.slice(-3).toUpperCase()}</Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-muted/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="hover:bg-primary/5">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                      {user?.name?.[0]}
                    </div>
                    <div className="flex flex-col overflow-hidden text-left flex-1">
                      <span className="text-xs font-bold truncate">{user?.name}</span>
                      <span className="text-[9px] text-muted-foreground truncate uppercase">{user?.email}</span>
                    </div>
                    <ChevronUp className="ml-auto w-4 h-4 text-muted-foreground opacity-50" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-[220px]">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">帳戶中心</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer flex items-center gap-2 py-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">用戶設置</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer flex items-center gap-2 py-2">
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-bold">中斷連線</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}