
"use client";

import { useAppStore } from "@/lib/store";
import { 
  LayoutDashboard, 
  Settings, 
  Layers, 
  Users, 
  LogOut,
  Terminal,
  User,
  ChevronUp,
  Box,
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
 * DashboardSidebar - 職責：管理維度核心與身分主權的導航入口。
 * 已整合架構邏輯至核心選單，實現更直覺的扁平化設計。
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
    { title: "邏輯容器", icon: Layers, href: "/dashboard/workspaces" },
    { title: "能力註冊", icon: Box, href: "/dashboard/workspaces/blocks" },
  ];

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 mb-4 px-1 hover:opacity-80 transition-opacity">
          <div className="p-1.5 bg-primary rounded-lg">
            <Fingerprint className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-headline tracking-tight italic">OrgVerse</span>
        </Link>
        <GlobalSwitcher />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>維度主控台 (Console)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className="transition-all duration-200"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-2">
            <SidebarGroupLabel className="p-0 text-xs font-bold uppercase tracking-widest opacity-50">活躍空間 (Active Nodes)</SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {orgWorkspaces.map((workspace) => (
                <SidebarMenuItem key={workspace.id}>
                  <SidebarMenuButton asChild isActive={pathname === `/dashboard/workspaces/${workspace.id}`} className="group">
                    <Link href={`/dashboard/workspaces/${workspace.id}`} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 truncate">
                        <Terminal className="w-3 h-3 text-primary/60 group-hover:text-primary" />
                        <span className="truncate text-xs">{workspace.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase group-hover:border-primary group-hover:text-primary transition-colors">
                        {workspace.id.slice(-3)}
                      </Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {orgWorkspaces.length === 0 && (
                <p className="text-[10px] text-muted-foreground px-2 italic">無活躍節點</p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                      {user?.name?.[0]}
                    </div>
                    <div className="flex flex-col overflow-hidden text-left flex-1">
                      <span className="text-xs font-semibold truncate">{user?.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
                    </div>
                    <ChevronUp className="ml-auto w-4 h-4 text-muted-foreground" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-[200px]">
                <DropdownMenuLabel className="text-xs">身分主權設定</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer flex items-center gap-2 text-xs">
                    <Settings className="w-4 h-4" />
                    <span>架構參數設定</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>中斷身分連線</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
