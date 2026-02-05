"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";

/**
 * 首頁落地頁 - 職責：展示 OrgVerse 核心價值與入口
 */
export default function Home() {
  const { user } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex justify-center">
          <div className="text-7xl animate-bounce duration-[3000ms]">🐢</div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground font-headline">
          歡迎來到 <span className="text-primary">OrgVerse</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          現代工作空間架構的全新敘事。從單一身分邁向多維組織的演進。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <FeatureCard 
            icon={<Shield className="w-6 h-6" />}
            title="數位主權"
            description="在無限的組織維度中，建立您獨一無二的數位身分。"
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="流動上下文"
            description="在不同空間無縫切換，享受即時的 UI 共振適配。"
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6" />}
            title="跨界協作"
            description="打破資訊孤島，透過精準的跨維度權限控制協作。"
          />
        </div>

        <div className="pt-8">
          <Button 
            size="lg" 
            className="rounded-full px-8 h-12 text-lg font-medium group"
            onClick={() => router.push("/login")}
          >
            進入閘道器
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-card border rounded-xl text-left hover:shadow-md transition-shadow">
      <div className="p-2 w-fit bg-primary/5 rounded-lg text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
