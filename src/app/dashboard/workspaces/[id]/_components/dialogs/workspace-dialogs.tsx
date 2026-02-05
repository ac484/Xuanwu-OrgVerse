"use client";

import { useWorkspace } from "../../workspace-context";
import { useFirebase } from "@/firebase/provider";
import { doc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileText, 
  ListTodo, 
  ShieldCheck, 
  Trophy, 
  AlertCircle, 
  MessageSquare,
  Landmark
} from "lucide-react";
import { WorkspaceStatus } from "@/types/domain";

interface WorkspaceDialogsProps {
  openStates: {
    settings: boolean;
    specs: boolean;
    capabilities: boolean;
    delete: boolean;
  };
  onOpenChange: (key: 'settings' | 'specs' | 'capabilities' | 'delete', open: boolean) => void;
}

export function WorkspaceDialogs({ openStates, onOpenChange }: WorkspaceDialogsProps) {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();
  const router = useRouter();

  const [editName, setEditName] = useState(workspace?.name || "");
  const [editVisibility, setEditVisibility] = useState(workspace?.visibility || "visible");
  const [editStatus, setEditStatus] = useState<WorkspaceStatus>(workspace?.status || "preparatory");
  const [editProtocol, setEditProtocol] = useState(workspace?.protocol || "");
  const [editScope, setEditScope] = useState((workspace?.scope || []).join(", "));

  useEffect(() => {
    if (workspace) {
      setEditName(workspace.name);
      setEditVisibility(workspace.visibility);
      setEditStatus(workspace.status || "preparatory");
      setEditProtocol(workspace.protocol || "");
      setEditScope((workspace.scope || []).join(", "));
    }
  }, [workspace]);

  const mountedCapIds = useMemo(() => 
    (workspace?.capabilities || []).map((c: any) => c.id),
    [workspace?.capabilities]
  );

  const handleUpdateSettings = useCallback(() => {
    const wsRef = doc(db, "workspaces", workspace.id);
    const updates = { 
      name: editName, 
      visibility: editVisibility,
      status: editStatus
    };
    
    updateDoc(wsRef, updates)
      .then(() => {
        emitEvent("校準空間設定", `${editName} [${editStatus}]`);
        onOpenChange('settings', false);
        toast({ title: "空間規格已同步" });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: wsRef.path,
          operation: 'update',
          requestResourceData: updates
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  }, [workspace.id, editName, editVisibility, editStatus, db, emitEvent, onOpenChange]);

  const handleUpdateSpecs = useCallback(() => {
    const wsRef = doc(db, "workspaces", workspace.id);
    const updates = {
      protocol: editProtocol,
      scope: editScope.split(",").map(s => s.trim()).filter(Boolean)
    };

    updateDoc(wsRef, updates)
      .then(() => {
        emitEvent("重定義協議範疇", editProtocol);
        onOpenChange('specs', false);
        toast({ title: "授權範疇已重定義" });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: wsRef.path,
          operation: 'update',
          requestResourceData: updates
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  }, [workspace.id, editProtocol, editScope, db, emitEvent, onOpenChange]);

  const handleDeleteWorkspace = useCallback(() => {
    const wsRef = doc(db, "workspaces", workspace.id);
    deleteDoc(wsRef)
      .then(() => {
        router.push("/dashboard/workspaces");
        toast({ title: "空間節點已銷毀" });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({
          path: wsRef.path,
          operation: 'delete'
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', error);
      });
  }, [workspace.id, db, router]);

  const handleAddCapability = useCallback((capKey: string) => {
    const capTemplates: Record<string, any> = {
      'files': { id: 'files', name: '檔案空間', type: 'data', description: '管理維度內的文檔主權與技術資產。', status: 'stable' },
      'tasks': { id: 'tasks', name: '原子任務', type: 'ui', description: '追蹤空間節點內的具體行動目標。', status: 'stable' },
      'qa': { id: 'qa', name: '品質檢驗', type: 'ui', description: '檢核原子數據執行品質的治理單元。', status: 'stable' },
      'acceptance': { id: 'acceptance', name: '最終驗收', type: 'ui', description: '驗收空間成果並終止 A 軌共振。', status: 'stable' },
      'finance': { id: 'finance', name: '財務核算', type: 'ui', description: '追蹤維度預算與驗收後的資金撥付。', status: 'beta' },
      'issues': { id: 'issues', name: '議題追蹤', type: 'ui', description: '處理技術衝突與 B 軌異常的治理模組。', status: 'stable' },
      'daily': { id: 'daily', name: '每日動態', type: 'ui', description: '極簡的空間技術協作脈動牆。', status: 'stable' },
    };
    
    const template = capTemplates[capKey];
    if (template) {
      const wsRef = doc(db, "workspaces", workspace.id);
      updateDoc(wsRef, { capabilities: arrayUnion(template) })
        .then(() => {
          emitEvent("掛載原子能力", template.name); 
          onOpenChange('capabilities', false);
          toast({ title: `${template.name} 已掛載` });
        })
        .catch(async () => {
          const error = new FirestorePermissionError({
            path: wsRef.path,
            operation: 'update',
            requestResourceData: { capabilities: 'arrayUnion' }
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', error);
        });
    }
  }, [workspace.id, db, onOpenChange, emitEvent]);

  return (
    <>
      <Dialog open={openStates.settings} onOpenChange={(o) => onOpenChange('settings', o)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">空間主權設定</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">空間節點名稱</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">當前狀態</Label>
              <Select value={editStatus} onValueChange={(v: WorkspaceStatus) => setEditStatus(v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preparatory">籌備 (Preparatory)</SelectItem>
                  <SelectItem value="active">啟動 (Active)</SelectItem>
                  <SelectItem value="stopped">停止 (Stopped)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/60">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">空間可見性</Label>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">決定是否顯示於維度目錄</p>
              </div>
              <Switch checked={editVisibility === 'visible'} onCheckedChange={(checked) => setEditVisibility(checked ? 'visible' : 'hidden')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange('settings', false)}>取消</Button>
            <Button onClick={handleUpdateSettings}>儲存變動</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openStates.specs} onOpenChange={(o) => onOpenChange('specs', o)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">重定義技術規格</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">存取協議 (Protocol)</Label>
              <Input value={editProtocol} onChange={(e) => setEditProtocol(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">授權範疇 (Scope)</Label>
              <Input value={editScope} onChange={(e) => setEditScope(e.target.value)} className="rounded-xl h-11" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange('specs', false)}>取消</Button>
            <Button onClick={handleUpdateSpecs}>確認重定義</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openStates.capabilities} onOpenChange={(o) => onOpenChange('capabilities', o)}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">掛載原子能力</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {[
              { id: 'files', name: '檔案空間', icon: <FileText className="w-6 h-6" />, desc: '管理主權文檔' },
              { id: 'tasks', name: '原子任務', icon: <ListTodo className="w-6 h-6" />, desc: '追蹤行動目標' },
              { id: 'qa', name: '品質檢驗', icon: <ShieldCheck className="w-6 h-6" />, desc: '執行數據品檢' },
              { id: 'acceptance', name: '最終驗收', icon: <Trophy className="w-6 h-6" />, desc: '成果交付結案' },
              { id: 'finance', name: '財務核算', icon: <Landmark className="w-6 h-6" />, desc: '預算撥付治理' },
              { id: 'issues', name: '議題追蹤', icon: <AlertCircle className="w-6 h-6" />, desc: '處理異常衝突' },
              { id: 'daily', name: '每日動態', icon: <MessageSquare className="w-6 h-6" />, desc: '技術脈動日誌' },
            ].map((cap) => (
              <Button 
                key={cap.id} 
                variant="outline" 
                className={`justify-start h-24 gap-4 rounded-2xl hover:bg-primary/5 group ${mountedCapIds.includes(cap.id) ? 'opacity-50 grayscale pointer-events-none' : ''}`} 
                onClick={() => handleAddCapability(cap.id)}
              >
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  {cap.icon}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold uppercase">{cap.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-normal leading-tight">{cap.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openStates.delete} onOpenChange={(o) => onOpenChange('delete', o)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive font-headline text-xl">啟動空間銷毀協議</DialogTitle>
          </DialogHeader>
          <div className="py-4 p-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-[11px] text-destructive italic">
            此操作將永久抹除空間節點「{workspace?.name}」及其下屬的所有原子數據與技術規格。
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange('delete', false)}>取消</Button>
            <Button variant="destructive" onClick={handleDeleteWorkspace}>確認銷毀</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
