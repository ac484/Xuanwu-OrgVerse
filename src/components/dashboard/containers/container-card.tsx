"use client";

import { Container } from "@/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, MoreVertical, ExternalLink } from "lucide-react";

interface ContainerCardProps {
  container: Container;
  onAction?: (id: string) => void;
}

export function ContainerCard({ container, onAction }: ContainerCardProps) {
  return (
    <Card className="group border-border/60 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Box className="w-5 h-5" />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onAction?.(container.id); }}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        <CardTitle className="mt-4 font-headline text-lg">{container.name}</CardTitle>
        <CardDescription className="text-xs">Logical boundary established recently.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize text-[10px] tracking-widest">{container.type}</Badge>
          <Badge variant="outline" className="text-[10px] tracking-widest bg-background/50">Active</Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">ID: {container.id}</span>
        <div className="flex -space-x-2">
          {[1, 2].map(i => (
            <div key={i} className="w-5 h-5 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold">U{i}</div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
