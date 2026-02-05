"use client";

import { useWorkspace } from "../../workspace-context";
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
        toast({ title: "文檔已掛載", description: `${fileName} 已同步。` });
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" /> 空間檔案庫
          </h3>
          <Badge variant="outline" className="text-[8px] h-4 border-primary/20 bg-primary/5 text-primary">
            SCOPE: {(scope || []).join(", ") || "UNSET"}
          </Badge>
        </div>
        <Button size="sm" className="h-9 gap-2 font-bold uppercase text-[10px] rounded-xl" onClick={handleUpload}>
          <UploadCloud className="w-4 h-4" /> 上傳檔案
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {files?.map(file => (
          <div key={file.id} className="p-4 bg-card/40 border border-border/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold">{file.name}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground font-mono">{file.size}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 
                    {file.timestamp?.seconds ? format(file.timestamp.seconds * 1000, "MM/dd HH:mm") : "同步中..."}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}