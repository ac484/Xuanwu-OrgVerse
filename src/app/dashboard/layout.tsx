"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UIAdapter } from "@/components/ui-adapter";
import { useFirebase } from "@/firebase/provider";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

/**
 * DashboardLayout - 職責：全局維度數據同步引擎。
 * 原子級最佳化：
 * 1. 使用 useMemo 鎖定所有 Firestore Query 引用，確保偵聽器不會因重新渲染而重啟。
 * 2. 實施分片數據獲取 (limit)，提升初始加載速度。
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAppStore(state => state.user);
  const setOrganizations = useAppStore(state => state.setOrganizations);
  const setWorkspaces = useAppStore(state => state.setWorkspaces);
  const setPulseLogs = useAppStore(state => state.setPulseLogs);
  const activeOrgId = useAppStore(state => state.activeOrgId);
  
  const { db } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  // 1. 穩定化：組織查詢 (僅偵聽屬於自己的維度)
  const orgsQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(collection(db, "organizations"), where("ownerId", "==", user.id));
  }, [user?.id, db]);

  // 2. 穩定化：空間查詢 (全域偵聽，權限由 Rules 控管)
  const wsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "workspaces"));
  }, [db]);

  // 3. 穩定化：全域脈動偵聽 (針對當前活動組織)
  const pulseQuery = useMemo(() => {
    if (!db || !activeOrgId) return null;
    return query(
      collection(db, "organizations", activeOrgId, "pulseLogs"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [db, activeOrgId]);

  // 同步組織：原子閉環
  useEffect(() => {
    if (!orgsQuery) return;
    const unsubscribe = onSnapshot(orgsQuery, 
      (snapshot) => {
        const orgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setOrganizations(orgs);
      },
      async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'organizations',
          operation: 'list',
        }));
      }
    );
    return () => unsubscribe();
  }, [orgsQuery, setOrganizations]);

  // 同步空間：原子閉環
  useEffect(() => {
    if (!wsQuery) return;
    const unsubscribe = onSnapshot(wsQuery, 
      (snapshot) => {
        const workspaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setWorkspaces(workspaces);
      },
      async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'workspaces',
          operation: 'list',
        }));
      }
    );
    return () => unsubscribe();
  }, [wsQuery, setWorkspaces]);

  // 同步脈動：原子閉環
  useEffect(() => {
    if (!pulseQuery) return;
    const unsubscribe = onSnapshot(pulseQuery, 
      (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setPulseLogs(logs);
      },
      async () => { /* 靜默處理脈動權限錯誤 */ }
    );
    return () => unsubscribe();
  }, [pulseQuery, setPulseLogs]);

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
