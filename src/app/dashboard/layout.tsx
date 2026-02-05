
"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

  // 同步組織資料
  useEffect(() => {
    if (!user || !db) return;

    const orgsQuery = query(
      collection(db, "organizations"), 
      where("ownerId", "==", user.id)
    );

    const unsubscribe = onSnapshot(
      orgsQuery, 
      (snapshot) => {
        const orgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
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
  }, [user, db, setOrganizations]);

  // 同步空間資料
  useEffect(() => {
    if (!user || !db) return;

    const wsQuery = query(collection(db, "workspaces"));
    
    const unsubscribe = onSnapshot(
      wsQuery, 
      (snapshot) => {
        const workspaces = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
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
