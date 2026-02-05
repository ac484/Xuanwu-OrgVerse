"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";

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
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Globe className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground font-headline">
          Welcome to <span className="text-primary">OrgVerse</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A Narrative of Modern Workspace Architecture. From Single Identity to Multidimensional Organization.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <FeatureCard 
            icon={<Shield className="w-6 h-6" />}
            title="Digital Sovereignty"
            description="Establish your unique identity across infinite organizational dimensions."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="Fluid Contexts"
            description="Seamlessly switch between spaces with instant UI adaptation."
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6" />}
            title="Cross-Boundary"
            description="Break silos with precise inter-organizational permission controls."
          />
        </div>

        <div className="pt-8">
          <Button 
            size="lg" 
            className="rounded-full px-8 h-12 text-lg font-medium group"
            onClick={() => router.push("/login")}
          >
            Enter the Gateway
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