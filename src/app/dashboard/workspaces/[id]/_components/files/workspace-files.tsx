"use client";

import { useWorkspace } from "../../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  UploadCloud, 
  Clock, 
  History, 
  RotateCcw, 
  Trash2, 
  CheckCircle2,
  MoreVertical,
  File,
  ImageIcon,
  FileArchive,
  FileCode,
  FileJson,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where, getDocs, limit } from "firebase/firestore";
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
 * WorkspaceFiles - 職責：高感官檔案版本治理中心
 * 參考 FileVersionPro 邏輯，實施極簡且強大的版本鏈管理。
 */
export function WorkspaceFiles() {
  const { workspace, emitEvent, scope } = useWorkspace();
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg': case 'jpeg': case 'png': case 'webp': return <ImageIcon className="w-5 h-5" />;
      case 'zip': case 'rar': case '7z': return <FileArchive className="w-5 h-5" />;
      case 'ts': case 'tsx': case 'js': return <FileCode className="w-5 h-5" />;
      case 'json': return <FileJson className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handleUpload = () => {
    const mockNames = ["架構規格書.pdf", "設計原稿.png", "環境配置.json", "核心協議.ts"];
    const fileName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const wsId = workspace.id;
    const fileCol = collection(db, "workspaces", wsId, "files");

    const checkQuery = query(fileCol, where("name", "==", fileName), limit(1));
    
    getDocs(checkQuery).then(snapshot => {
      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];
        const data = existingDoc.data();
        const nextVer = (data.versions?.length || 0) + 1;
        const newVersion = {
          versionId: Math.random().toString(36).slice(-6),
          versionNumber: nextVer,
          versionName: `修訂版本 #${nextVer}`,
          size: "2.4 MB",
          uploadedBy: user?.name || "維度協作者",
          createdAt: new Date().toISOString()
        };

        updateDoc(doc(db, "workspaces", wsId, "files", existingDoc.id), {
          versions: [...(data.versions || []), newVersion],
          currentVersionId: newVersion.versionId,
          updatedAt: serverTimestamp()
        }).then(() => {
          emitEvent("檔案版本共振", `${fileName} (v${nextVer})`);
          toast({ title: "版本已迭代", description: `${fileName} 已升級至 v${nextVer}` });
        });
      } else {
        const initialVid = Math.random().toString(36).slice(-6);
        const newFile = {
          name: fileName,
          currentVersionId: initialVid,
          updatedAt: serverTimestamp(),
          versions: [{
            versionId: initialVid,
            versionNumber: 1,
            versionName: "初始規格定義",
            size: "1.8 MB",
            uploadedBy: user?.name || "維度協作者",
            createdAt: new Date().toISOString()
          }]
        };
        addDoc(fileCol, newFile).then(() => {
          emitEvent("掛載新文檔", fileName);
          toast({ title: "文檔已上傳", description: `${fileName} 已同步至空間` });
        });
      }
    });
  };

  const handleRestore = (file: any, versionId: string) => {
    const docRef = doc(db, "workspaces", workspace.id, "files", file.id);
    updateDoc(docRef, { currentVersionId: versionId, updatedAt: serverTimestamp() }).then(() => {
      const ver = file.versions.find((v: any) => v.versionId === versionId);
      emitEvent("還原檔案狀態", `${file.name} -> v${ver?.versionNumber}`);
      toast({ title: "版本已回溯", description: `空間已切換至 v${ver?.versionNumber}` });
      setHistoryFile(null);
    });
  };

  const handleDeleteVersion = (file: any, versionId: string) => {
    const docRef = doc(db, "workspaces", workspace.id, "files", file.id);
    const newVersions = file.versions.filter((v: any) => v.versionId !== versionId);
    
    if (newVersions.length === 0) {
      deleteDoc(docRef).then(() => {
        emitEvent("銷毀檔案節點", file.name);
        toast({ title: "檔案已徹底移除" });
        setHistoryFile(null);
      });
    } else {
      const isCurrent = file.currentVersionId === versionId;
      const updates: any = { versions: newVersions, updatedAt: serverTimestamp() };
      if (isCurrent) updates.currentVersionId = newVersions[newVersions.length - 1].versionId;
      
      updateDoc(docRef, updates).then(() => {
        toast({ title: "特定版本已註銷" });
        setHistoryFile(null);
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> 空間技術檔案庫
          </h3>
          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter opacity-60">
            治理範疇: {(scope || []).join(" / ")}
          </p>
        </div>
        <Button size="sm" className="h-9 gap-2 font-black uppercase text-[10px] rounded-full shadow-lg shadow-primary/20 px-5" onClick={handleUpload}>
          <UploadCloud className="w-4 h-4" /> 上傳技術文檔
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="col-span-5">檔案識別 / 名稱</div>
          <div className="col-span-3 text-center">活躍版本</div>
          <div className="col-span-3">最後同步</div>
          <div className="col-span-1 text-right">操作</div>
        </div>
        
        <div className="divide-y divide-border/40">
          {files?.map(file => {
            const current = file.versions?.find((v: any) => v.versionId === file.currentVersionId) || file.versions?.[0];
            return (
              <div key={file.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center group hover:bg-primary/[0.02] transition-colors">
                <div className="col-span-5 flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border shadow-sm text-primary">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-black tracking-tight text-foreground truncate">{file.name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-tighter">{current?.size}</span>
                  </div>
                </div>
                <div className="col-span-3 flex justify-center">
                  <Badge variant="secondary" className="text-[9px] font-black h-5 px-2 bg-primary/10 text-primary border-none">
                    V{current?.versionNumber}
                  </Badge>
                </div>
                <div className="col-span-3 flex flex-col">
                  <span className="text-[10px] font-bold text-foreground/80">{current?.uploadedBy}</span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock className="w-2.5 h-2.5" /> 剛剛
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl w-48">
                      <DropdownMenuItem onClick={() => setHistoryFile(file)} className="gap-2 text-[10px] font-bold uppercase tracking-widest py-2.5">
                        <History className="w-3.5 h-3.5 text-primary" /> 版本歷程治理
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-[10px] font-bold uppercase tracking-widest py-2.5 text-destructive">
                        <Trash2 className="w-3.5 h-3.5" /> 註銷檔案
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          {(!files || files.length === 0) && (
            <div className="p-20 text-center space-y-4 opacity-20">
              <UploadCloud className="w-12 h-12 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">空間檔案庫虛無中</p>
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!historyFile} onOpenChange={(o) => !o && setHistoryFile(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0 border-l-border/40">
          <div className="p-8 border-b bg-primary/5">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <History className="w-5 h-5" />
                </div>
                <SheetTitle className="font-black text-xl tracking-tight">版本歷程治理</SheetTitle>
              </div>
              <SheetDescription className="font-mono text-[10px] uppercase tracking-widest bg-background/50 p-2 rounded-lg border border-primary/10">
                NODE_REF: {historyFile?.id.slice(-8).toUpperCase()} / {historyFile?.name}
              </SheetDescription>
            </SheetHeader>
          </div>
          
          <ScrollArea className="flex-1 p-8">
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary/40 before:to-transparent">
              {historyFile?.versions?.slice().reverse().map((v: any) => (
                <div key={v.versionId} className="relative group">
                  <div className={cn(
                    "absolute -left-10 top-1 w-5 h-5 rounded-full border-4 border-background ring-2 transition-all",
                    historyFile.currentVersionId === v.versionId 
                      ? "bg-primary ring-primary/20 scale-125 shadow-lg shadow-primary/30 animate-pulse" 
                      : "bg-muted ring-muted/20"
                  )} />
                  
                  <div className={cn(
                    "p-5 rounded-2xl border transition-all duration-300",
                    historyFile.currentVersionId === v.versionId 
                      ? "bg-primary/5 border-primary/30 ring-1 ring-primary/10" 
                      : "bg-muted/30 border-border/60 hover:border-primary/20"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-black tracking-tight">{v.versionName}</p>
                      {historyFile.currentVersionId === v.versionId && (
                        <Badge className="bg-primary text-white text-[8px] font-black border-none h-4 px-1.5 uppercase">Active</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                      <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> v{v.versionNumber}</div>
                      <div className="text-right">{v.uploadedBy}</div>
                    </div>

                    <div className="flex gap-2">
                      {historyFile.currentVersionId !== v.versionId && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-[9px] font-black uppercase tracking-widest gap-2 flex-1 rounded-xl bg-background border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                          onClick={() => handleRestore(historyFile, v.versionId)}
                        >
                          <RotateCcw className="w-3 h-3" /> 還原狀態
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        onClick={() => handleDeleteVersion(historyFile, v.versionId)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
