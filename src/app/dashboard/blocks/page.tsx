"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus, Zap, Code, Database, Layers } from "lucide-react";

export default function BlocksPage() {
  const { resourceBlocks, organizations, activeOrgId } = useAppStore();
  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  const getIcon = (type: string) => {
    switch (type) {
      case 'api': return <Code className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="Stackable Blocks" 
        description="Modular logic units to extend your dimensional capabilities."
      >
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Catalog Block
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resourceBlocks.map((block) => (
          <Card key={block.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {getIcon(block.type)}
                </div>
                <Badge className={block.status === 'stable' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}>
                  {block.status.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-lg font-headline">{block.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{block.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">Type: {block.type}</Badge>
                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">Org: {activeOrg.name}</Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t border-border/20 py-4 flex justify-between items-center">
              <span className="text-[10px] font-bold text-muted-foreground">ID: {block.id.toUpperCase()}</span>
              <Button size="sm" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-widest">
                <Zap className="w-3.5 h-3.5 fill-current" /> Deploy
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all group border-border/40">
          <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <p className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Connect Block</p>
        </button>
      </div>
    </div>
  );
}
