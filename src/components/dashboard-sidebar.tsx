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
  Settings,
  Activity,
  Grid3X3,
  GlobeLock,
  Users,
  Settings2
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

/**
 * DashboardSidebar - 職責：維度導航中樞
 * 統一了所有選單圖示，確保視覺一致性。
 */
export function DashboardSidebar() {
  const { user, logout, activeOrgId, workspaces } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const orgWorkspaces = workspaces.filter(w => w.orgId === activeOrgId);

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
                <SidebarMenuButton asChild isActive={pathname === '/dashboard'} className="transition-all duration-200">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="font-semibold">維度脈動</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/organization/audit'} className="transition-all duration-200">
                  <Link href="/dashboard/organization/audit" className="flex items-center gap-3">
                    <Activity className="w-4 h-4" />
                    <span className="font-semibold">審計串流</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="transition-all duration-200">
                      <FolderTree className="w-4 h-4" />
                      <span className="font-semibold">組織架構</span>
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
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/organization/matrix'}>
                          <Link href="/dashboard/organization/matrix" className="flex items-center gap-2">
                            <Grid3X3 className="w-3 h-3" /> 權限矩陣
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/organization/external'}>
                          <Link href="/dashboard/organization/external" className="flex items-center gap-2">
                            <GlobeLock className="w-3 h-3" /> 外部閘道
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
                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/workspaces')} className="transition-all duration-200">
                  <Link href="/dashboard/workspaces" className="flex items-center gap-3">
                    <Layers className="w-4 h-4" />
                    <span className="font-semibold">邏輯空間</span>
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
                  <SidebarMenuButton asChild isActive={pathname === `/dashboard/workspaces/${workspace.id}`} className="group">
                    <Link href={`/dashboard/workspaces/${workspace.id}`} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 truncate">
                        <Terminal className="w-3 h-3 text-primary/60 group-hover:text-primary transition-colors" />
                        <span className="truncate text-xs font-medium">{workspace.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase">{workspace.id.slice(-3).toUpperCase()}</Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {orgWorkspaces.length === 0 && (
                <div className="px-3 py-2 border border-dashed rounded-lg mx-2 bg-muted/10">
                  <p className="text-[9px] text-muted-foreground italic text-center">無活躍空間</p>
                </div>
              )}
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
