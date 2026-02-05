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
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setOrganizations, setWorkspaces } = useAppStore();
  const { db } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // 最佳化：記憶化查詢引用，防止偵聽器因重新渲染而重複初始化
  const orgsQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(collection(db, "organizations"), where("ownerId", "==", user.id));
  }, [user?.id, db]);

  const wsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "workspaces"));
  }, [db]);

  // 同步組織資料
  useEffect(() => {
    if (!orgsQuery) return;

    const unsubscribe = onSnapshot(
      orgsQuery, 
      (snapshot) => {
        const orgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setOrganizations(orgs);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'organizations',
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [orgsQuery, setOrganizations]);

  // 同步空間資料
  useEffect(() => {
    if (!wsQuery) return;

    const unsubscribe = onSnapshot(
      wsQuery, 
      (snapshot) => {
        const workspaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setWorkspaces(workspaces);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'workspaces',
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [wsQuery, setWorkspaces]);

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
