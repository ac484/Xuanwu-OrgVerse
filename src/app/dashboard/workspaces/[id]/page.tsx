"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Settings, 
  Zap, 
  Globe,
  Box,
  Activity,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { WorkspaceProvider, useWorkspace } from "./workspace-context";
import { ScrollArea } from "@/components/ui/scroll-area";

import { WorkspaceFiles } from "./_components/files/workspace-files";
import { WorkspaceTasks } from "./_components/tasks/workspace-tasks";
import { WorkspaceIssues } from "./_components/issues/workspace-issues";
import { WorkspaceDaily } from "./_components/daily/workspace-daily";
import { WorkspaceMembersManagement } from "./_components/members/workspace-members-management";
import { WorkspaceQA } from "./_components/qa/workspace-qa";
import { WorkspaceAcceptance } from "./_components/acceptance/workspace-acceptance";
import { WorkspaceCapabilities } from "./_components/capabilities/workspace-capabilities";
import { WorkspaceDialogs } from "./_components/dialogs/workspace-dialogs";
import { WorkspaceFinance } from "./_components/finance/workspace-finance";

/**
 * WorkspaceDetailPage - 職責：作為空間治理的容器頁面。
 */
export default function WorkspaceDetailPage() {
  const { id } = useParams();
  
  return (
    <WorkspaceProvider workspaceId={id as string}>
      <WorkspaceContent />
    </WorkspaceProvider>
  );
}

function WorkspaceContent() {
  const { workspace, protocol, scope, localPulse } = useWorkspace();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [dialogs, setDialogs] = useState({
    settings: false,
    specs: false,
    capabilities: false,
    delete: false
  });

  const mountedCapIds = useMemo(() => 
    (workspace.capabilities || []).map((c: any) => c.id),
    [workspace.capabilities]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleDialog = (key: keyof typeof dialogs, open: boolean) => {
    setDialogs(prev => ({ ...prev, [key]: open }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 gpu-accelerated">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 hover:bg-primary/5">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span>維度空間</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">{workspace.name}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive border-destructive/20 hover:bg-destructive/5 font-bold uppercase text-[10px] tracking-widest"
          onClick={() => toggleDialog('delete', true)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" /> 銷毀空間
        </Button>
      </div>

      <PageHeader 
        title={workspace.name} 
        description="管理此空間的原子能力堆疊、資料交換與治理協議。"
        badge={
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-[0.1em] font-bold px-2 py-0.5">
              ID: {workspace.id.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-[9px] uppercase font-bold flex items-center gap-1 bg-background/50 backdrop-blur-sm">
              {workspace.visibility === 'visible' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {workspace.visibility === 'visible' ? '已掛載' : '隔離中'}
            </Badge>
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest" onClick={() => toggleDialog('settings', true)}>
            <Settings className="w-3.5 h-3.5" /> 空間設定
          </Button>
          <Button size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" onClick={() => toggleDialog('specs', true)}>
            <Zap className="w-3.5 h-3.5" /> 調整規格
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Tabs defaultValue="capabilities" className="space-y-6">
            <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl w-full flex overflow-x-auto justify-start no-scrollbar">
              <TabsTrigger value="capabilities" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">能力清單</TabsTrigger>
              {mountedCapIds.includes('files') && <TabsTrigger value="files" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">檔案</TabsTrigger>}
              {mountedCapIds.includes('tasks') && <TabsTrigger value="tasks" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">任務</TabsTrigger>}
              {mountedCapIds.includes('qa') && <TabsTrigger value="qa" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">品檢</TabsTrigger>}
              {mountedCapIds.includes('acceptance') && <TabsTrigger value="acceptance" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">驗收</TabsTrigger>}
              {mountedCapIds.includes('finance') && <TabsTrigger value="finance" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">財務核算</TabsTrigger>}
              {mountedCapIds.includes('issues') && <TabsTrigger value="issues" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">議題</TabsTrigger>}
              {mountedCapIds.includes('daily') && <TabsTrigger value="daily" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">動態牆</TabsTrigger>}
              <TabsTrigger value="members" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">存取治理</TabsTrigger>
              <TabsTrigger value="specs" className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">技術規格</TabsTrigger>
            </TabsList>

            <TabsContent value="capabilities">
              <WorkspaceCapabilities onOpenAddCap={() => toggleDialog('capabilities', true)} />
            </TabsContent>

            <TabsContent value="files"><WorkspaceFiles /></TabsContent>
            <TabsContent value="tasks"><WorkspaceTasks /></TabsContent>
            <TabsContent value="qa"><WorkspaceQA /></TabsContent>
            <TabsContent value="acceptance"><WorkspaceAcceptance /></TabsContent>
            <TabsContent value="finance"><WorkspaceFinance /></TabsContent>
            <TabsContent value="issues"><WorkspaceIssues /></TabsContent>
            <TabsContent value="daily"><WorkspaceDaily /></TabsContent>
            <TabsContent value="members"><WorkspaceMembersManagement /></TabsContent>

            <TabsContent value="specs" className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/60 shadow-sm bg-card/30 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-between text-primary">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" /> 授權範疇
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {(scope || []).map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] uppercase tracking-tighter px-2 py-0.5 bg-primary/5 text-primary border-primary/20">{s}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm bg-card/30 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-between text-primary">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4" /> 存取協議
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="p-4 bg-muted/50 rounded-xl border border-border/40 shadow-inner">
                      <p className="text-xs font-mono font-bold text-primary">{protocol || 'Default'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
            <CardHeader className="pb-3 bg-primary/5 border-b">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary animate-pulse" /> 空間脈動 (Local)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-border/40">
                  {localPulse.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-primary/5 transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold leading-tight group-hover:text-primary transition-colors">
                          {log.action}
                        </p>
                        <time className="text-[8px] text-muted-foreground/60 font-mono">
                          {log.timestamp?.seconds ? format(log.timestamp.seconds * 1000, "HH:mm:ss") : "同步中..."}
                        </time>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {log.actor}
                        </span>
                        <Badge variant="ghost" className="text-[7px] h-3 px-1 border-none opacity-40 group-hover:opacity-100 uppercase tracking-tighter">Event</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <WorkspaceDialogs 
        openStates={dialogs}
        onOpenChange={(key, open) => toggleDialog(key, open)}
      />
    </div>
  );
}