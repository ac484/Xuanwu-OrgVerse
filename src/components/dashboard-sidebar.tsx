"use client";

import { useAppStore } from "@/lib/store";
import { 
  LayoutDashboard, 
  Settings, 
  Layers, 
  Users, 
  LogOut,
  Terminal,
  ChevronUp,
  Fingerprint
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
  SidebarSeparator
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

/**
 * DashboardSidebar - 職責：維度導航中樞
 * 已移除所有舊有 Container 與 Blocks 語義入口。
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

  const mainMenuItems = [
    { title: "維度脈動", icon: LayoutDashboard, href: "/dashboard" },
    { title: "共鳴團隊", icon: Users, href: "/dashboard/team" },
    { title: "邏輯空間", icon: Layers, href: "/dashboard/workspaces" },
  ];

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
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 px-3">維度主控台</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href || (item.href === '/dashboard/workspaces' && pathname.startsWith('/dashboard/workspaces'))}
                    className="transition-all duration-200 hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span className="font-semibold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-4 opacity-50" />

        <SidebarGroup>
          <div className="flex items-center justify-between px-3 mb-2">
            <SidebarGroupLabel className="p-0 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">活躍空間列表</SidebarGroupLabel>
          </div>
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
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase group-hover:border-primary group-hover:text-primary transition-all">
                        {workspace.id.slice(-3).toUpperCase()}
                      </Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {orgWorkspaces.length === 0 && (
                <div className="px-3 py-2 border border-dashed rounded-lg mx-2 bg-muted/20">
                  <p className="text-[9px] text-muted-foreground italic text-center uppercase tracking-widest">無活躍空間</p>
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
                <SidebarMenuButton size="lg" className="hover:bg-primary/5 transition-all">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 shadow-inner">
                      {user?.name?.[0]}
                    </div>
                    <div className="flex flex-col overflow-hidden text-left flex-1">
                      <span className="text-xs font-bold truncate">{user?.name}</span>
                      <span className="text-[9px] text-muted-foreground truncate uppercase tracking-tighter">{user?.email}</span>
                    </div>
                    <ChevronUp className="ml-auto w-4 h-4 text-muted-foreground opacity-50" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-[220px] shadow-xl border-border/60">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">身分主權設定</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer flex items-center gap-2 py-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">架構參數與策略</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 py-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-bold">中斷維度連線</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}