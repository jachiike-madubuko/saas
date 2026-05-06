"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/nav/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.push("/login");
      return;
    }
    if (appUser && !appUser.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [firebaseUser, appUser, loading, router]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-cyber-bg grid-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-float">🦆</div>
          <p className="text-cyber-dim text-sm font-mono animate-pulse-neon">Initializing systems…</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser || !appUser) return null;

  return (
    <div className="h-full flex flex-col bg-cyber-bg">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
