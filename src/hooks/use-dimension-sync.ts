
"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { useFirebase } from "@/firebase/provider";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

/**
 * useDimensionSync - 職責：處理全域維度與空間的實時數據同步
 * 符合單一職責原則 (SRP)，將同步邏輯從 Layout 中解耦。
 */
export function useDimensionSync() {
  const user = useAppStore(state => state.user);
  const { setOrganizations, setWorkspaces, setPulseLogs, activeOrgId } = useAppStore();
  const { db } = useFirebase();

  // 1. 穩定化：維度查詢 (僅偵聽屬於自己的維度)
  const orgsQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(collection(db, "organizations"), where("ownerId", "==", user.id));
  }, [user?.id, db]);

  // 2. 穩定化：空間查詢
  const wsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "workspaces"));
  }, [db]);

  // 3. 穩定化：全域脈動偵聽
  const pulseQuery = useMemo(() => {
    if (!db || !activeOrgId) return null;
    return query(
      collection(db, "organizations", activeOrgId, "pulseLogs"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [db, activeOrgId]);

  useEffect(() => {
    if (!orgsQuery) return;
    const unsubscribe = onSnapshot(orgsQuery, 
      (snapshot) => {
        const orgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setOrganizations(orgs);
      },
      () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'organizations',
          operation: 'list',
        }));
      }
    );
    return () => unsubscribe();
  }, [orgsQuery, setOrganizations]);

  useEffect(() => {
    if (!wsQuery) return;
    const unsubscribe = onSnapshot(wsQuery, 
      (snapshot) => {
        const workspaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setWorkspaces(workspaces);
      },
      () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'workspaces',
          operation: 'list',
        }));
      }
    );
    return () => unsubscribe();
  }, [wsQuery, setWorkspaces]);

  useEffect(() => {
    if (!pulseQuery) return;
    const unsubscribe = onSnapshot(pulseQuery, 
      (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setPulseLogs(logs);
      },
      () => {}
    );
    return () => unsubscribe();
  }, [pulseQuery, setPulseLogs]);
}
