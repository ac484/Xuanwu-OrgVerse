"use client";

import { useWorkspace } from "../../workspace-context";
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Box, 
  Trash2, 
  FileText, 
  ListTodo, 
  ShieldCheck, 
  Trophy, 
  AlertCircle, 
  MessageSquare, 
  Layers, 
  Plus 
} from "lucide-react";
import { useFirebase } from "@/firebase/provider";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { useCallback } from "react";

interface WorkspaceCapabilitiesProps {
  onOpenAddCap: () => void;
}

/**
 * WorkspaceCapabilities - 職責：管理空間已掛載的「原子能力」
 */
export function WorkspaceCapabilities({ onOpenAddCap }: WorkspaceCapabilitiesProps) {
  const { workspace, emitEvent } = useWorkspace();
  const { db } = useFirebase();

  const handleRemoveCapability = useCallback((cap: any) => {
    const wsRef = doc(db, "workspaces", workspace.id);
    updateDoc(wsRef, { capabilities: arrayRemove(cap) })
      .then(() => {
        emitEvent("卸載原子能力", cap.name);
        toast({ title: "原子能力已卸載" });
      });
  }, [workspace.id, db, emitEvent]);

  const getIcon = (id: string) => {
    switch (id) {
      case 'files': return <FileText className="w-5 h-5" />;
      case 'tasks': return <ListTodo className="w-5 h-5" />;
      case 'qa': return <ShieldCheck className="w-5 h-5" />;
      case 'acceptance': return <Trophy className="w-5 h-5" />;
      case 'issues': return <AlertCircle className="w-5 h-5" />;
      case 'daily': return <MessageSquare className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Box className="w-4 h-4" /> 已掛載原子能力
        </h3>
        <button 
          onClick={onOpenAddCap}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" /> 掛載新能力
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(workspace.capabilities || []).map((cap: any) => (
          <Card key={cap.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {getIcon(cap.id)}
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 bg-background">
                  {cap.status === 'stable' ? 'PRODUCTION' : 'BETA'}
                </Badge>
              </div>
              <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">{cap.name}</CardTitle>
              <CardDescription className="text-[11px] mt-1 leading-relaxed">{cap.description}</CardDescription>
            </CardHeader>
            <CardFooter className="border-t border-border/10 flex justify-between items-center py-4 bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground opacity-60">SPEC_ID: {cap.id.toUpperCase()}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                onClick={() => handleRemoveCapability(cap)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {(workspace.capabilities || []).length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl opacity-20">
            <Box className="w-12 h-12 mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">此空間尚未掛載任何原子能力</p>
          </div>
        )}
      </div>
    </div>
  );
}
