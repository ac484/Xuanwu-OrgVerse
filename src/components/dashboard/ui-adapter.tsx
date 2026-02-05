"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { adaptUIColorToOrgContext } from "@/ai/flows/adapt-ui-color-to-org-context";
import { Skeleton } from "@/components/ui/skeleton";
import { hexToHsl } from "@/lib/utils";
import { useFirebase } from "@/firebase/provider";
import { doc, updateDoc } from "firebase/firestore";

/**
 * UIAdapter - 職責：根據組織上下文自動適配全站色彩主權。
 */
export function UIAdapter({ children }: { children: React.ReactNode }) {
  const { organizations, activeOrgId } = useAppStore();
  const { db } = useFirebase();
  const [isAdapting, setIsAdapting] = useState(false);
  const adaptingId = useRef<string | null>(null);

  const activeOrg = organizations.find(o => o.id === activeOrgId);

  useEffect(() => {
    async function adaptTheme() {
      if (!activeOrg || activeOrg.theme || adaptingId.current === activeOrg.id) return;

      adaptingId.current = activeOrg.id;
      setIsAdapting(true);
      
      try {
        const result = await adaptUIColorToOrgContext({ 
          organizationContext: activeOrg.description || "General business workspace"
        });
        
        if (result && adaptingId.current === activeOrg.id) {
          const orgRef = doc(db, "organizations", activeOrg.id);
          const themeUpdates = {
            primary: result.primaryColor,
            background: result.backgroundColor,
            accent: result.accentColor,
          };
          
          updateDoc(orgRef, { theme: themeUpdates });
        }
      } catch (error) {
        console.error("Theme adaptation failed:", error);
      } finally {
        setIsAdapting(false);
        adaptingId.current = null;
      }
    }

    adaptTheme();
  }, [activeOrgId, activeOrg?.description, activeOrg?.theme, db]);

  useEffect(() => {
    const root = document.documentElement;
    if (activeOrg?.theme) {
      root.style.setProperty('--primary', hexToHsl(activeOrg.theme.primary));
      root.style.setProperty('--background', hexToHsl(activeOrg.theme.background));
      root.style.setProperty('--accent', hexToHsl(activeOrg.theme.accent));
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--background');
      root.style.removeProperty('--accent');
    }
  }, [activeOrg?.theme]);

  if (isAdapting) {
    return (
      <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
        <Skeleton className="h-14 w-[300px] rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[160px] w-full rounded-2xl" />
          <Skeleton className="h-[160px] w-full rounded-2xl" />
          <Skeleton className="h-[160px] w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return <>{children}</>;
}
