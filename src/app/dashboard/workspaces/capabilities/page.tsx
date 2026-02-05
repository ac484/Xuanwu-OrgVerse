
"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Database, Layers, Info, Terminal, ChevronRight, Layout, ShieldCheck, Trophy, MessageSquare, AlertCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * CapabilitiesPage - 職責：原子能力註冊表
 * 集中管理維度中所有可掛載的技術規範。
 */
export default function CapabilitiesPage() {
  const router = useRouter();

  const availableCapabilities = [
    { id: 'files', name: '檔案空間', type: 'data', status: 'stable', description: '管理維度內的文檔與資產，實施 Scope 存取隔離。', icon: <FileText className="w-5 h-5" /> },
    { id: 'tasks', name: '原子任務', type: 'ui', status: 'stable', description: '追蹤空間內的行動目標，與 QA/驗收能力連動。', icon: <Layout className="w-5 h-5" /> },
    { id: 'qa', name: '品質檢驗', type: 'ui', status: 'stable', description: '檢核任務執行品質，自動觸發 B 軌異常議題。', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'acceptance', name: '最終驗收', type: 'ui', status: 'stable', description: '驗收成果並結案，確保 A 軌價值鏈閉環。', icon: <Trophy className="w-5 h-5" /> },
    { id: 'issues', name: '議題追蹤', type: 'ui', status: 'stable', description: 'B 軌治理中心，追蹤技術衝突與 QA 駁回記錄。', icon: <AlertCircle className="w-5 h-5" /> },
    { id: 'daily', name: '每日動態', type: 'ui', status: 'stable', description: '技術協作日誌牆，提供非同步的維度觀察分享。', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'api-storage', name: '分散式存儲接口', type: 'api', status: 'beta', description: '跨維度的高速數據存取協議封裝。', icon: <Code className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/dashboard/workspaces')}>維度空間</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">原子能力註冊表</span>
      </div>

      <PageHeader 
        title="原子能力註冊表" 
        description="定義可供邏輯空間掛載的技術規範，確保模組間保持絕對技術隔離與統一通訊協議。"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCapabilities.map((cap) => (
          <Card key={cap.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {cap.icon}
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
        <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40 hover:bg-muted/10 transition-colors">
          <Terminal className="w-8 h-8 text-muted-foreground mb-4 opacity-20" />
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">擴展新能力</p>
          <p className="text-[9px] text-muted-foreground/50 mt-2 max-w-[160px]">遵循維度協議規範，自定義您的專屬原子單元。</p>
        </div>
      </div>
    </div>
  );
}
