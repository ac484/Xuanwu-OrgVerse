"use client";

import { Container } from "@/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, MoreVertical, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContainerCardProps {
  container: Container;
  onAction?: (id: string) => void;
}

/**
 * ContainerCard - 職責：純粹的基礎設施網格展示。
 * 專注於展示 Context 與 Scope，不包含業務行為。
 */
export function ContainerCard({ container, onAction }: ContainerCardProps) {
  const router = useRouter();

  return (
    <Card 
      className="group border-border/60 hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer bg-card/60 backdrop-blur-sm"
      onClick={() => router.push(`/dashboard/containers/${container.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Terminal className="w-5 h-5" />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:bg-accent/10" 
            onClick={(e) => { e.stopPropagation(); onAction?.(container.id); }}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        <CardTitle className="mt-4 font-headline text-lg group-hover:text-primary transition-colors">{container.name}</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest font-bold opacity-60">
          Context: {container.context}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {container.scope.slice(0, 3).map(s => (
            <Badge key={s} variant="secondary" className="text-[8px] px-1.5 py-0 uppercase tracking-tighter bg-muted/50 border-none">
              {s}
            </Badge>
          ))}
          {container.scope.length > 3 && (
            <span className="text-[8px] text-muted-foreground font-bold">+{container.scope.length - 3}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center border-t border-border/20 mt-4 py-4">
        <div className="flex flex-col">
          <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter leading-none">Resolver</span>
          <span className="text-[10px] font-mono truncate max-w-[120px]">{container.resolver}</span>
        </div>
        <div className="flex -space-x-1.5">
          {[1, 2].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold shadow-sm">U{i}</div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
