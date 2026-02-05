"use client";

import { useWorkspace } from "../../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  UploadCloud, 
  Clock, 
  History, 
  RotateCcw, 
  Trash2, 
  MoreVertical,
  ImageIcon,
  FileArchive,
  FileCode,
  FileJson,
  User,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, where, getDocs, limit } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { useMemo, useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * WorkspaceFiles - 職責：高感官檔案版本治理中心 (超越版)
 * 特色：智能類型偵測、版本歷程視覺化、秒級主權還原。
 */
export function WorkspaceFiles() {
  const { workspace, emitEvent } = useWorkspace();
  const { user } = useAppStore();
  const { db } = useFirebase();
  const [historyFile, setHistoryFile] = useState<any | null>(null);

  const filesQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(
      collection(db, "workspaces", workspace.id, "files"),
      orderBy("updatedAt", "desc")
    );
  }, [db, workspace.id]);

  const { data: files } = useCollection<any>(filesQuery);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg': case 'jpeg': case 'png': return <ImageIcon className="w-5 h-5" />;
      case 'zip': case '7z': case 'rar': return <FileArchive className="w-5 h-5" />;
      case 'ts': case 'tsx': case 'js': return <FileCode className="w-5 h-5" />;
      case 'json': return <FileJson className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handleUpload = () => {
    const mockNames = ["技術架構圖.png", "環境配置.json", "核心協議.ts", "專案進度表.pdf"];
    const fileName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const fileCol = collection(db, "workspaces", workspace.id, "files");

    // 智能上傳：同名偵測與版本升級
    getDocs(query(fileCol, where("name", "==", fileName), limit(1))).then(snapshot => {
      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];
        const data = existingDoc.data();
        const nextVer = (data.versions?.length || 0) + 1;
        const newVersion = {
          versionId: Math.random().toString(36).slice(-6),
          versionNumber: nextVer,
          versionName: `修訂版本 #${nextVer}`,
          size: 1024 * 1024 * (1 + Math.random() * 4),
          uploadedBy: user?.name || "維度協作者",
          createdAt: new Date().toISOString()
        };

        updateDoc(doc(db, "workspaces", workspace.id, "files", existingDoc.id), {
          versions: [...(data.versions || []), newVersion],
          currentVersionId: newVersion.versionId,
          updatedAt: serverTimestamp()
        }).then(() => {
          emitEvent("檔案版本迭代", `${fileName} (v${nextVer})`);
          toast({ title: "版本已迭代", description: `${fileName} 已升級至 v${nextVer}。` });
        });
      } else {
        const vid = Math.random().toString(36).slice(-6);
        addDoc(fileCol, {
          name: fileName,
          currentVersionId: vid,
          updatedAt: serverTimestamp(),
          versions: [{
            versionId: vid,
            versionNumber: 1,
            versionName: "初始規格定義",
            size: 1024 * 512,
            uploadedBy: user?.name || "維度協作者",
            createdAt: new Date().toISOString()
          }]
        }).then(() => {
          emitEvent("掛載新文檔", fileName);
          toast({ title: "文檔已上傳", description: `${fileName} 已掛載至空間。` });
        });
      }
    });
  };

  const handleRestore = (file: any, versionId: string) => {
    updateDoc(doc(db, "workspaces", workspace.id, "files", file.id), { 
      currentVersionId: versionId, 
      updatedAt: serverTimestamp() 
    }).then(() => {
      emitEvent("還原檔案狀態", `${file.name} 至歷史版本`);
      toast({ title: "版本已回溯", description: "檔案主權已恢復至指定時間點。" });
      setHistoryFile(null);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> 空間檔案主權庫
        </h3>
        <Button size="sm" className="h-9 gap-2 font-black uppercase text-[10px] rounded-full shadow-lg" onClick={handleUpload}>
          <UploadCloud className="w-4 h-4" /> 上傳技術文檔
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="col-span-5">檔案識別 / 名稱</div>
          <div className="col-span-2 text-center">活躍版本</div>
          <div className="col-span-2">大小</div>
          <div className="col-span-2">最後同步</div>
          <div className="col-span-1 text-right">操作</div>
        </div>
        
        <div className="divide-y divide-border/40">
          {files?.map(file => {
            const current = file.versions?.find((v: any) => v.versionId === file.currentVersionId) || file.versions?.[0];
            return (
              <div key={file.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center group hover:bg-primary/[0.02] transition-colors">
                <div className="col-span-5 flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    {getFileIcon(file.name)}
                  </div>
                  <span className="text-sm font-black tracking-tight truncate">{file.name}</span>
                </div>
                <div className="col-span-2 flex justify-center">
                  <Badge variant="secondary" className="text-[9px] font-black h-5 bg-primary/10 text-primary border-none">V{current?.versionNumber}</Badge>
                </div>
                <div className="col-span-2 text-[10px] font-mono text-muted-foreground uppercase">{formatBytes(current?.size || 0)}</div>
                <div className="col-span-2 flex flex-col">
                  <span className="text-[10px] font-bold">{current?.uploadedBy}</span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium"><Clock className="w-2.5 h-2.5" /> SYNCED</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl w-48">
                      <DropdownMenuItem onClick={() => setHistoryFile(file)} className="gap-2 text-[10px] font-bold uppercase py-2.5 cursor-pointer">
                        <History className="w-3.5 h-3.5 text-primary" /> 版本歷程治理
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-[10px] font-bold uppercase py-2.5 text-destructive cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> 註銷檔案
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          {(!files || files.length === 0) && (
            <div className="p-20 text-center flex flex-col items-center gap-3 opacity-20">
              <AlertCircle className="w-12 h-12" />
              <p className="text-[10px] font-black uppercase tracking-widest">空間尚無技術檔案</p>
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!historyFile} onOpenChange={(o) => !o && setHistoryFile(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0 border-l-border/40">
          <div className="p-8 border-b bg-primary/5">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <History className="w-5 h-5 text-primary" />
                <SheetTitle className="font-black text-xl">版本歷程治理</SheetTitle>
              </div>
              <SheetDescription className="font-mono text-[10px] uppercase tracking-widest">{historyFile?.name}</SheetDescription>
            </SheetHeader>
          </div>
          
          <ScrollArea className="flex-1 p-8">
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/20">
              {historyFile?.versions?.slice().reverse().map((v: any) => (
                <div key={v.versionId} className="relative">
                  <div className={cn(
                    "absolute -left-10 top-1 w-5 h-5 rounded-full border-4 border-background ring-2 transition-all",
                    historyFile.currentVersionId === v.versionId ? "bg-primary ring-primary/20 scale-125 shadow-lg shadow-primary/30" : "bg-muted ring-muted/20"
                  )} />
                  <div className={cn(
                    "p-5 rounded-2xl border transition-all", 
                    historyFile.currentVersionId === v.versionId ? "bg-primary/5 border-primary/30 shadow-sm" : "bg-muted/30 border-border/60"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black">{v.versionName}</p>
                      {historyFile.currentVersionId === v.versionId && (
                        <Badge className="text-[8px] bg-primary uppercase font-black gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase">
                      <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> {v.uploadedBy}</span>
                      <span>{formatBytes(v.size)}</span>
                    </div>
                    {historyFile.currentVersionId !== v.versionId && (
                      <Button variant="outline" size="sm" className="w-full mt-4 h-8 text-[9px] font-black uppercase bg-background hover:bg-primary hover:text-white transition-all" onClick={() => handleRestore(historyFile, v.versionId)}>
                        <RotateCcw className="w-3 h-3 mr-2" /> 還原此版本
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}