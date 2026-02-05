"use client";

import { Container } from "@/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContainerCardProps {
  container: Container;
  onAction?: (id: string) => void;
}

/**
 * ContainerCard - 職責：標準化的容器網格展示元件
 * 提供點擊導航與動作選單。
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
            <Box className="w-5 h-5" />
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
        <CardDescription className="text-[11px] uppercase tracking-wider font-medium opacity-70">
          Logical boundary: {container.type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize text-[9px] px-2 py-0.5 tracking-widest bg-muted/50">
            {container.type}
          </Badge>
          <Badge variant="outline" className="text-[9px] px-2 py-0.5 tracking-widest bg-background/30 border-primary/20 text-primary">
            Active
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center border-t border-border/20 mt-2 py-4">
        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">HEX-ID: {container.id.toUpperCase()}</span>
        <div className="flex -space-x-1.5">
          {[1, 2].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold shadow-sm">U{i}</div>
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-background bg-primary/10 text-[8px] flex items-center justify-center font-bold text-primary shadow-sm">+</div>
        </div>
      </CardFooter>
    </Card>
  );
}
