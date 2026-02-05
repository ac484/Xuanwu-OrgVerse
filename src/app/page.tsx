"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

/**
 * 首頁落地頁 - 職責：展示 🐢 核心價值與入口 
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <button
        aria-label="Enter OrgVerse"
        onClick={() => router.push("/login")}
        className="text-7xl animate-bounce duration-[3000ms] hover:scale-110 transition-transform"
      >
        🐢
      </button>
    </div>
  );
}
