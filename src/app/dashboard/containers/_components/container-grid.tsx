"use client";

import { Container } from "@/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, MoreVertical } from "lucide-react";

export function ContainerGrid({ containers }: { containers: Container[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {containers.map((container) => (
        <Card key={container.id} className="group border-border/60 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Box className="w-5 h-5" />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            <CardTitle className="mt-4 font-headline">{container.name}</CardTitle>
            <CardDescription>Logical boundary established recently.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize text-[10px] tracking-widest">{container.type}</Badge>
              <Badge variant="outline" className="text-[10px] tracking-widest">Active</Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">ID: {container.id}</span>
            <div className="flex -space-x-2">
              {[1, 2].map(i => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold">U{i}</div>
              ))}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
