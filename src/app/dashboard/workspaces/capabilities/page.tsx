"use client";

/**
 * CapabilitiesPage - 職責：原子能力註冊表
 * 作為「邏輯空間 (Workspace)」可掛載能力的技術規格目錄。
 */
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Database, Layers, Info, Terminal, ChevronRight, Layout } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CapabilitiesPage() {
  const router = useRouter();

  const availableCapabilities = [
    { id: 'ui-auth', name: '身分驗證 UI 單元', type: 'ui', status: 'stable', description: '提供標準的維度登入與身分共振介面。' },
    { id: 'api-storage', name: '分散式存儲接口', type: 'api', status: 'stable', description: '跨維度的高速數據存取協議封裝。' },
    { id: 'data-ledger', name: '主權審計帳本', type: 'data', status: 'beta', description: '不可篡改的技術規格變動追蹤單元。' }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'ui': return <Layout className="w-5 h-5" />;
      case 'api': return <Code className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/dashboard/workspaces')}>維度空間</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">原子能力註冊表</span>
      </div>

      <PageHeader 
        title="原子能力註冊表" 
        description="定義可供邏輯空間掛載的技術規範，確保模組間保持絕對技術隔離。"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCapabilities.map((cap) => (
          <Card key={cap.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {getIcon(cap.type)}
                </div>
                <Badge variant="outline" className="text-[9px] uppercase tracking-[0.1em] font-bold bg-background/50">
                  {cap.status === 'stable' ? '穩定版' : '測試版'}
                </Badge>
              </div>
              <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">{cap.name}</CardTitle>
              <CardDescription className="text-[11px] leading-relaxed mt-1">{cap.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className="text-[9px] font-bold uppercase tracking-tighter bg-muted/60 text-muted-foreground border-none">
                  TYPE: {cap.type.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/10 flex justify-between items-center bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground/60">ID: {cap.id.toUpperCase()}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-2 font-bold uppercase text-[9px] tracking-[0.1em] text-primary hover:bg-primary/5">
                <Info className="w-3.5 h-3.5" /> 查看介面規格
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
