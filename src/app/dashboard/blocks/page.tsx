"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Code, Database, Layers, Info } from "lucide-react";

/**
 * BlocksPage - 職責：作為技術能力目錄，展示可用的原子化邏輯單元。
 * 不再涉及「佈署」動作，僅提供技術規範的查看。
 */
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
        title="Capability Catalog" 
        description="Technical specifications of modular units available for integration."
      >
        <Button variant="outline" className="gap-2 font-bold uppercase text-[10px] tracking-widest h-10 px-4">
          <Plus className="w-4 h-4" /> Register Specification
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
                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">Spec: {block.type}</Badge>
                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">Org Scope: {activeOrg.name}</Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t border-border/20 py-4 flex justify-between items-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">SIG: {block.id}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-widest text-primary">
                <Info className="w-3.5 h-3.5" /> View Schema
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
