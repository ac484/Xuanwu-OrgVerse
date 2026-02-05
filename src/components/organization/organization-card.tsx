"use client";

import { Organization } from "@/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, MoreVertical, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrganizationCardProps {
  organization: Organization;
  onAction?: (id: string) => void;
}

/**
 * OrganizationCard - 職責：維度實體的視覺化網格入口。
 */
export function OrganizationCard({ organization, onAction }: OrganizationCardProps) {
  const router = useRouter();

  return (
    <Card 
      className="group border-border/60 hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer bg-card/60 backdrop-blur-sm"
      onClick={() => router.push(`/dashboard`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Globe className="w-5 h-5" />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:bg-accent/10" 
            onClick={(e) => { e.stopPropagation(); onAction?.(organization.id); }}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        <CardTitle className="mt-4 font-headline text-lg group-hover:text-primary transition-colors">{organization.name}</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest font-bold opacity-60">
          主權角色: {organization.role}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
          {organization.description || "未提供維度識別描述。"}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center border-t border-border/20 mt-4 py-4">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-primary opacity-50" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
            {(organization.members || []).length} 位授權成員
          </span>
        </div>
        <div className="flex -space-x-1.5">
          {(organization.members || []).slice(0, 3).map((m, i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold shadow-sm">
              {m.name?.[0]}
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
