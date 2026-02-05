"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UIAdapter } from "@/components/dashboard/ui-adapter";
import { useDimensionSync } from "@/hooks/use-dimension-sync";

/**
 * DashboardLayout - 職責：提供維度治理的全域外殼與 UI 適配環境。
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAppStore(state => state.user);
  const router = useRouter();

  // 啟動全域數據同步共振
  useDimensionSync();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-y-auto content-visibility-auto">
          <UIAdapter>
            {children}
          </UIAdapter>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
