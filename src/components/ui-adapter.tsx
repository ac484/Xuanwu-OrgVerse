"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { adaptUIColorToOrgContext } from "@/ai/flows/adapt-ui-color-to-org-context";
import { Skeleton } from "@/components/ui/skeleton";

export function UIAdapter({ children }: { children: React.ReactNode }) {
  const { organizations, activeOrgId, updateOrgTheme } = useAppStore();
  const [isAdapting, setIsAdapting] = useState(false);

  const activeOrg = organizations.find(o => o.id === activeOrgId);

  useEffect(() => {
    async function adaptTheme() {
      if (!activeOrg || activeOrg.theme) return;

      setIsAdapting(true);
      try {
        const result = await adaptUIColorToOrgContext({ 
          organizationContext: activeOrg.context 
        });
        
        if (result) {
          updateOrgTheme(activeOrg.id, {
            primary: result.primaryColor,
            background: result.backgroundColor,
            accent: result.accentColor,
          });
        }
      } catch (error) {
        console.error("Theme adaptation failed:", error);
      } finally {
        setIsAdapting(false);
      }
    }

    adaptTheme();
  }, [activeOrgId, activeOrg, updateOrgTheme]);

  // Apply CSS variables dynamically if theme exists
  useEffect(() => {
    if (activeOrg?.theme) {
      const root = document.documentElement;
      // We're simplified here, normally would convert hex to HSL for shadcn
      // But for this demo, we'll just set some basic styles or use standard primary
      root.style.setProperty('--primary-override', activeOrg.theme.primary);
      root.style.setProperty('--bg-override', activeOrg.theme.background);
    }
  }, [activeOrg?.theme]);

  if (isAdapting) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}