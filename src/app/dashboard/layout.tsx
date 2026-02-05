
"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UIAdapter } from "@/components/ui-adapter";
import { useDimensionSync } from "@/hooks/use-dimension-sync";

/**
 * DashboardLayout - 職責：提供維度治理的全局外殼與 UI 適配環境。
 * 優化：數據同步邏輯已移至 useDimensionSync，保持 Layout 高度聚焦。
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
