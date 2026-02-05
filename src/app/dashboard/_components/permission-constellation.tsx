"use client";

import { UserRole } from "@/types/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

/**
 * PermissionConstellation - 職責：展示當前維度的權限階層架構
 */
export function PermissionConstellation({ currentRole }: { currentRole: UserRole }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-headline tracking-tight">權限星圖</h2>
      <Card className="border-border/60 overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="p-4 bg-primary/5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">當前模型</span>
          </div>
          <Badge variant="outline" className="bg-background text-[9px] uppercase font-bold tracking-tighter">漸進式存取</Badge>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            <PermissionTier 
              name="擁有者 (Owner)" 
              description="最高主權。具備容器銷毀權限。" 
              active={currentRole === 'Owner'} 
            />
            <PermissionTier 
              name="管理員 (Admin)" 
              description="操作指揮官。資源分配權限。" 
              active={currentRole === 'Admin'} 
            />
            <PermissionTier 
              name="成員 (Member)" 
              description="價值創造者。範圍內完整的讀寫權限。" 
              active={currentRole === 'Member'} 
            />
            <PermissionTier 
              name="訪客 (Guest)" 
              description="受限觀察者。對其他維度不可見。" 
              active={currentRole === 'Guest'} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PermissionTier({ name, description, active }: { name: string, description: string, active: boolean }) {
  return (
    <div className={`p-4 flex items-center gap-4 transition-all duration-300 ${active ? 'bg-primary/5' : 'grayscale-[0.5] opacity-60'}`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${active ? 'text-primary' : ''}`}>{name}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </div>
      {active && <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-primary/20">當前身分</Badge>}
    </div>
  );
}
