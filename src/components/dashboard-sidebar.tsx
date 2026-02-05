"use client";

import { useAppStore } from "@/lib/store";
import { 
  LayoutDashboard, 
  Settings, 
  Layers, 
  Users, 
  Package, 
  HelpCircle,
  LogOut,
  Plus,
  Box
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

export function DashboardSidebar() {
  const { user, logout, activeOrgId, organizations, containers } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];
  const orgContainers = containers.filter(c => c.orgId === activeOrgId);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems = [
    { title: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Logical Containers", icon: Layers, href: "/dashboard/containers" },
    { title: "Resonance Team", icon: Users, href: "/dashboard/team" },
    { title: "Stackable blocks", icon: Package, href: "/dashboard/blocks" },
    { title: "Architecture", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 mb-4 px-1 hover:opacity-80 transition-opacity">
          <div className="p-1.5 bg-primary rounded-lg">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-headline tracking-tight">OrgVerse</span>
        </Link>
        <GlobalSwitcher />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dimension Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className="transition-all duration-200"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
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
            <SidebarGroupLabel className="p-0 text-xs font-bold uppercase">Root Containers</SidebarGroupLabel>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {orgContainers.map((container) => (
                <SidebarMenuItem key={container.id}>
                  <SidebarMenuButton asChild isActive={pathname === `/dashboard/containers/${container.id}`} className="group">
                    <Link href={`/dashboard/containers/${container.id}`} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 truncate">
                        <Box className="w-3 h-3 text-primary/60 group-hover:text-primary" />
                        <span className="truncate">{container.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase group-hover:border-primary group-hover:text-primary transition-colors">
                        {container.type[0]}
                      </Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {orgContainers.length === 0 && (
                <p className="text-[10px] text-muted-foreground px-2 italic">No containers established.</p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-3 bg-muted/30 rounded-lg mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.name?.[0]}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold truncate">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/5">
              <LogOut className="w-4 h-4" />
              <span>Sever Identity</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
