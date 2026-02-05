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
  ChevronRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where, getDocs, limit } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
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

  const handleUpload = () => {
    const fileName = `設計規格書_v${Math.floor(Math.random() * 10)}.pdf`;
    const wsId = workspace.id;
    const fileCol = collection(db, "workspaces", wsId, "files");

    // 檢查同名檔案以進行版本升級
    const checkQuery = query(fileCol, where("name", "==", fileName), limit(1));
    
    getDocs(checkQuery).then(snapshot => {
      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];
        const data = existingDoc.data();
        const nextVersionNum = (data.versions?.length || 0) + 1;
        const newVersion = {
          versionId: Math.random().toString(36).slice(-6),
          versionNumber: nextVersionNum,
          versionName: `修訂版本 ${nextVersionNum}`,
          size: "1.5 MB",
          uploadedBy: user?.name || "未知",
          createdAt: new Date().toISOString()
        };

        const docRef = doc(db, "workspaces", wsId, "files", existingDoc.id);
        updateDoc(docRef, {
          versions: [...(data.versions || []), newVersion],
          currentVersionId: newVersion.versionId,
          updatedAt: serverTimestamp()
        }).then(() => {
          emitEvent("檔案版本升級", `${fileName} (v${nextVersionNum})`);
          toast({ title: "版本已更新", description: `${fileName} 已升級至 v${nextVersionNum}。` });
        });
      } else {
        // 建立新檔案
        const initialVersionId = Math.random().toString(36).slice(-6);
        const newFile = {
          name: fileName,
          currentVersionId: initialVersionId,
          updatedAt: serverTimestamp(),
          versions: [{
            versionId: initialVersionId,
            versionNumber: 1,
            versionName: "初始版本",
            size: "1.2 MB",
            uploadedBy: user?.name || "未知",
            createdAt: new Date().toISOString()
          }]
        };
        addDoc(fileCol, newFile).then(() => {
          emitEvent("上傳新文檔", fileName);
          toast({ title: "文檔已掛載", description: `${fileName} 已同步至空間。` });
        });
      }
    });
  };

  const handleRestore = (file: any, versionId: string) => {
    const docRef = doc(db, "workspaces", workspace.id, "files", file.id);
    updateDoc(docRef, { currentVersionId: versionId, updatedAt: serverTimestamp() }).then(() => {
      const ver = file.versions.find((v: any) => v.versionId === versionId);
      emitEvent("還原檔案版本", `${file.name} -> v${ver?.versionNumber}`);
      toast({ title: "版本已還原", description: `已切換至 v${ver?.versionNumber}。` });
      setHistoryFile(null);
    });
  };

  const handleDeleteVersion = (file: any, versionId: string) => {
    const docRef = doc(db, "workspaces", workspace.id, "files", file.id);
    const newVersions = file.versions.filter((v: any) => v.versionId !== versionId);
    
    if (newVersions.length === 0) {
      deleteDoc(docRef).then(() => {
        emitEvent("銷毀檔案節點", file.name);
        toast({ title: "檔案已移除" });
        setHistoryFile(null);
      });
    } else {
      const isCurrent = file.currentVersionId === versionId;
      const updates: any = { versions: newVersions, updatedAt: serverTimestamp() };
      if (isCurrent) updates.currentVersionId = newVersions[newVersions.length - 1].versionId;
      
      updateDoc(docRef, updates).then(() => {
        toast({ title: "版本已刪除" });
        setHistoryFile({ ...file, ...updates });
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" /> 空間檔案庫 (Versioned)
          </h3>
          <Badge variant="outline" className="text-[8px] h-4 border-primary/20 bg-primary/5 text-primary uppercase font-bold tracking-tighter">
            SCOPE: {(scope || []).join(", ")}
          </Badge>
        </div>
        <Button size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] rounded-xl shadow-lg shadow-primary/20" onClick={handleUpload}>
          <UploadCloud className="w-4 h-4" /> 上傳文檔
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {files?.map(file => {
          const current = file.versions?.find((v: any) => v.versionId === file.currentVersionId) || file.versions?.[0];
          return (
            <div key={file.id} className="p-4 bg-card/40 border border-border/60 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/5 rounded-xl text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold">{file.name}</h4>
                    <Badge variant="secondary" className="text-[8px] h-4 px-1.5 font-bold">v{current?.versionNumber}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">{current?.size}</span>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {current?.uploadedBy} · 剛才
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full">
                  <Download className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground rounded-full">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => setHistoryFile(file)} className="gap-2 text-xs font-bold uppercase tracking-tight py-2">
                      <History className="w-3.5 h-3.5" /> 版本歷程
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={!!historyFile} onOpenChange={(o) => !o && setHistoryFile(null)}>
        <SheetContent className="sm:max-w-md flex flex-col">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="flex items-center gap-2 font-headline text-xl">
              <History className="w-5 h-5 text-primary" /> 版本歷程治理
            </SheetTitle>
            <SheetDescription className="font-mono text-xs uppercase tracking-tight">
              {historyFile?.name}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 -mr-4 pr-4 py-6">
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
              {historyFile?.versions?.slice().reverse().map((v: any) => (
                <div key={v.versionId} className="relative pl-10">
                  <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-background ring-2 ${historyFile.currentVersionId === v.versionId ? 'bg-primary ring-primary/20 animate-pulse' : 'bg-muted ring-muted/20'}`} />
                  <div className="space-y-2 p-4 bg-muted/20 rounded-2xl border border-border/40 hover:border-primary/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">{v.versionName}</p>
                      {historyFile.currentVersionId === v.versionId && (
                        <Badge className="bg-primary/10 text-primary text-[8px] font-bold border-none h-4">使用中</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                      <span>v{v.versionNumber} · {v.uploadedBy}</span>
                      <span>{v.size}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {historyFile.currentVersionId !== v.versionId && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[9px] font-bold uppercase tracking-widest gap-1 flex-1 hover:bg-primary/5 hover:text-primary"
                          onClick={() => handleRestore(historyFile, v.versionId)}
                        >
                          <RotateCcw className="w-3 h-3" /> 還原此版本
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-destructive hover:bg-destructive/10 px-2"
                        onClick={() => handleDeleteVersion(historyFile, v.versionId)}
                      >
                        <Trash2 className="w-3 h-3" />
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
