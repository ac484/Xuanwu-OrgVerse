"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UIAdapter } from "@/components/ui-adapter";
import { useFirebase } from "@/firebase/provider";
import { collection, query, where, onSnapshot } from "firebase/firestore";

/**
 * DashboardLayout - 職責：儀表板佈局的核心封裝，並實現 Firestore 資料同步
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setOrganizations, setWorkspaces } = useAppStore();
  const { db } = useFirebase();
  const router = useRouter();

  // 1. 導向登入（如果沒有身分）
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // 2. 即時同步當前使用者的組織 (Organizations)
  useEffect(() => {
    if (!user || !db) return;

    // 建立查詢：僅抓取 ownerId 符合目前使用者的組織
    const orgsQuery = query(
      collection(db, "organizations"), 
      where("ownerId", "==", user.id)
    );

    const unsubscribe = onSnapshot(orgsQuery, (snapshot) => {
      const orgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      setOrganizations(orgs);
    });

    return () => unsubscribe();
  }, [user, db, setOrganizations]);

  // 3. 即時同步空間 (Workspaces)
  useEffect(() => {
    if (!user || !db) return;

    const wsQuery = query(collection(db, "workspaces"));
    // 註：實際應用中應加入更嚴格的權限過濾，這裡先進行全局同步供開發使用
    const unsubscribe = onSnapshot(wsQuery, (snapshot) => {
      const workspaces = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      setWorkspaces(workspaces);
    });

    return () => unsubscribe();
  }, [user, db, setWorkspaces]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          <UIAdapter>
            {children}
          </UIAdapter>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
