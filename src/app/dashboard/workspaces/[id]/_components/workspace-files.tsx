"use client";

import { useWorkspace } from "../workspace-context";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, UploadCloud, Clock, Box, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { useMemo } from "react";

export function WorkspaceFiles() {
  const { workspace, emitEvent, scope } = useWorkspace();
  const { user } = useAppStore();
  const { db } = useFirebase();

  // 原子優化：記憶化查詢引用
  const filesQuery = useMemo(() => {
    if (!db || !workspace.id) return null;
    return query(
      collection(db, "workspaces", workspace.id, "files"),
      orderBy("timestamp", "desc")
    );
  }, [db, workspace.id]);

  const { data: files } = useCollection<any>(filesQuery);

  const handleUpload = () => {
    const fileName = `規格草案_${Math.random().toString(36).slice(-4)}.pdf`;
    const fileData = {
      name: fileName,
      size: "1.2 MB",
      type: "PDF",
      uploadedBy: user?.name || "未知",
      timestamp: serverTimestamp()
    };

    const filesCol = collection(db, "workspaces", workspace.id, "files");
    addDoc(filesCol, fileData)
      .then(() => {
        emitEvent("上傳文檔資產", fileName);
        toast({ title: "文檔已掛載", description: `${fileName} 已同步至雲端空間。` });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: `workspaces/${workspace.id}/files`,
          operation: 'create',
          requestResourceData: fileData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" /> 空間檔案庫 (Cloud Sync)
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[8px] h-4 border-primary/20 bg-primary/5 text-primary">
              SCOPE: { (scope || []).join(", ") || "UNSET" }
            </Badge>
          </div>
        </div>
        <Button size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest rounded-xl" onClick={handleUpload}>
          <UploadCloud className="w-4 h-4" /> 上傳檔案
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {files?.map(file => (
          <div key={file.id} className="p-4 bg-card/40 border border-border/60 rounded-2xl hover:bg-primary/5 transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">{file.name}</h4>
                  <ShieldCheck className="w-3 h-3 text-green-500 opacity-50" />
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[8px] px-1.5 font-bold uppercase bg-background">{file.type}</Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">{file.size}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 
                    {file.timestamp?.seconds ? format(file.timestamp.seconds * 1000, "MM/dd HH:mm") : "同步中..."}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block mr-4">
                <p className="text-[8px] font-bold text-muted-foreground uppercase">上傳者</p>
                <p className="text-[10px] font-bold">{file.uploadedBy}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {(!files || files.length === 0) && (
          <div className="p-20 text-center border-2 border-dashed rounded-3xl opacity-20">
            <FileText className="w-12 h-12 mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">目前無檔案資產</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Box className="w-4 h-4" /></div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">授權範疇聲明</p>
          <p className="text-[11px] text-muted-foreground">
            此空間當前具備 [{(scope || []).join(", ") || "全域"}] 範疇授權。所有註冊的文檔資產均需符合此技術邊界。
          </p>
        </div>
      </div>
    </div>
  );
}
