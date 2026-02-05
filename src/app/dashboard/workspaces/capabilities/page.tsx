"use client";

import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layout, ShieldCheck, Trophy, MessageSquare, AlertCircle, FileText, Layers, Info, Terminal, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * CapabilitiesPage - 職責：原子能力註冊表 (Capability Registry)
 * 定義維度中所有可掛載至空間節點的技術規格與介面標準。
 */
export default function CapabilitiesPage() {
  const router = useRouter();
  const { capabilitySpecs } = useAppStore();

  const getIcon = (id: string) => {
    switch (id) {
      case 'files': return <FileText className="w-5 h-5" />;
      case 'tasks': return <Layout className="w-5 h-5" />;
      case 'qa': return <ShieldCheck className="w-5 h-5" />;
      case 'acceptance': return <Trophy className="w-5 h-5" />;
      case 'issues': return <AlertCircle className="w-5 h-5" />;
      case 'daily': return <MessageSquare className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/dashboard/workspaces')}>空間節點</span>
        <ChevronRight className="w-3 h-3 opacity-30" />
        <span className="text-foreground">原子能力註冊表</span>
      </div>

      <PageHeader 
        title="原子能力註冊表" 
        description="定義可供空間節點掛載的技術規範與單元標準，確保模組間保持絕對技術隔離。"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capabilitySpecs.map((cap) => (
          <Card key={cap.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {getIcon(cap.id)}
                </div>
                <Badge variant="outline" className="text-[9px] uppercase tracking-[0.1em] font-bold bg-background/50">
                  {cap.status === 'stable' ? 'PRODUCTION' : 'BETA'}
                </Badge>
              </div>
              <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">{cap.name}</CardTitle>
              <CardDescription className="text-[11px] leading-relaxed mt-1">{cap.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className="text-[9px] font-bold uppercase tracking-tighter bg-muted/60 text-muted-foreground border-none">
                  層級: 原子能力 (CAPABILITY)
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/10 flex justify-between items-center bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground/60">SPEC_ID: {cap.id.toUpperCase()}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-[0.1em] text-primary hover:bg-primary/5">
                <Info className="w-3.5 h-3.5" /> 查看介面規格
              </Button>
            </CardFooter>
          </Card>
        ))}
        <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40 hover:bg-muted/10 transition-colors">
          <Terminal className="w-8 h-8 text-muted-foreground mb-4 opacity-20" />
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">擴展能力規格</p>
          <p className="text-[9px] text-muted-foreground/50 mt-2 max-w-[160px]">遵循維度協議規範，自定義您的專屬原子單元。</p>
        </div>
      </div>
    </div>
  );
}
