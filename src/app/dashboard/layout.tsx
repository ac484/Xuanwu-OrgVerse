"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { UIAdapter } from "@/components/ui-adapter";
import { Bell, Search, Command } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/60 backdrop-blur-md px-6">
          <SidebarTrigger />
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Access logical containers..." 
                className="pl-10 pr-10 bg-muted/40 border-none h-9 focus-visible:ring-1"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 bg-background shadow-sm">
                <Command className="w-2.5 h-2.5" /> K
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-accent rounded-full transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent-foreground rounded-full border-2 border-background" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <UIAdapter>
            {children}
          </UIAdapter>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}