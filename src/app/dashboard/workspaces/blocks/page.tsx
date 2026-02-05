
"use client";

/**
 * BlocksPage - 職責：原子化能力規範註冊表
 * 作為「邏輯空間 (Workspace)」可掛載能力的技術規格目錄。
 */
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Database, Layers, Info, Terminal, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BlocksPage() {
  const { resourceBlocks } = useAppStore();
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'api': return <Code className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/dashboard/workspaces')}>邏輯空間</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">原子能力規範</span>
      </div>

      <PageHeader 
        title="原子能力註冊表" 
        description="定義可供邏輯空間掛載的技術規範與 Facade 接口，模組間保持絕對技術隔離。"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resourceBlocks.map((block) => (
          <Card key={block.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {getIcon(block.type)}
                </div>
                <Badge variant="outline" className="text-[9px] uppercase tracking-[0.1em] font-bold bg-background/50">
                  {block.status === 'stable' ? 'PRODUCTION' : 'BETA'}
                </Badge>
              </div>
              <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">{block.name}</CardTitle>
              <CardDescription className="text-[11px] leading-relaxed mt-1">{block.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className="text-[9px] font-bold uppercase tracking-tighter bg-muted/60 text-muted-foreground border-none">
                  TYPE: {block.type}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/10 flex justify-between items-center bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground/60">SPEC_ID: {block.id.toUpperCase()}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-[0.1em] text-primary hover:bg-primary/5">
                <Info className="w-3.5 h-3.5" /> 查看 FACADE 規格
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40 hover:bg-muted/10 transition-colors">
          <Terminal className="w-8 h-8 text-muted-foreground mb-4 opacity-20" />
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">開發中規格</p>
          <p className="text-[9px] text-muted-foreground/50 mt-2 max-w-[160px]">更多原子化能力正在維度實驗室中成型...</p>
        </div>
      </div>
    </div>
  );
}
