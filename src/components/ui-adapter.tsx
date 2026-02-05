"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { adaptUIColorToOrgContext } from "@/ai/flows/adapt-ui-color-to-org-context";
import { Skeleton } from "@/components/ui/skeleton";
import { hexToHsl } from "@/lib/utils";

/**
 * UIAdapter acts as a middleware component that listens to the active organization
 * and applies AI-driven theme transformations to the global CSS environment.
 */
export function UIAdapter({ children }: { children: React.ReactNode }) {
  const { organizations, activeOrgId, updateOrgTheme } = useAppStore();
  const [isAdapting, setIsAdapting] = useState(false);

  const activeOrg = organizations.find(o => o.id === activeOrgId);

  // Trigger AI adaptation when switching to an organization without a theme
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

  // Apply HSL-converted CSS variables to the document root
  useEffect(() => {
    if (activeOrg?.theme) {
      const root = document.documentElement;
      
      // Update core ShadCN variables
      root.style.setProperty('--primary', hexToHsl(activeOrg.theme.primary));
      root.style.setProperty('--background', hexToHsl(activeOrg.theme.background));
      root.style.setProperty('--accent', hexToHsl(activeOrg.theme.accent));
      
      // Optional: Set foregrounds based on luminosity if needed
      // For now, we rely on standard fallback contrast
    } else {
      // Reset to defaults if no theme is active (e.g. personal space)
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--background');
      root.style.removeProperty('--accent');
    }
  }, [activeOrg?.theme]);

  if (isAdapting) {
    return (
      <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-[300px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        </div>
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
