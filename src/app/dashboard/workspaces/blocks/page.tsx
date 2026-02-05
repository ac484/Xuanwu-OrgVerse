"use client";

/**
 * BlocksPage - 職責：原子化能力註冊表
 * 提供可供 Workspace 掛載的技術規範目錄，不涉及具體業務佈署。
 */
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Database, Layers, Info, Terminal } from "lucide-react";

export default function BlocksPage() {
  const { resourceBlocks } = useAppStore();

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
        title="原子化能力註冊表" 
        description="定義可掛載於各維度邏輯空間的獨立業務單元規範。"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resourceBlocks.map((block) => (
          <Card key={block.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {getIcon(block.type)}
                </div>
                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">
                  {block.status === 'stable' ? '穩定版' : '測試版'}
                </Badge>
              </div>
              <CardTitle className="text-lg font-headline">{block.name}</CardTitle>
              <CardDescription className="text-xs">{block.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className="text-[9px] bg-muted text-muted-foreground border-none">原子類型: {block.type}</Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t border-border/10 py-4 flex justify-between items-center">
              <span className="text-[9px] font-mono text-muted-foreground">ID: {block.id}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-widest text-primary">
                <Info className="w-3.5 h-3.5" /> 查看 Facade 規格
              </Button>
            </CardFooter>
          </Card>
        ))}
        <div className="p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40 min-h-[200px]">
          <Terminal className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">開發中單元</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">更多原子化能力正在維度中成型...</p>
        </div>
      </div>
    </div>
  );
}
