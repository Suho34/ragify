"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import ThemeProvider from "@/components/ThemeProvider";
import AppNav from "@/components/AppNav";
import { LiveblocksProvider } from "@/components/LiveblocksProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <ThemeProvider>
        <div className="flex min-h-svh flex-col bg-bg">
          <nav className="flex h-14 items-center gap-2 border-b border-border px-4 sm:px-6">
            <div className="animate-shimmer h-6 w-6 rounded bg-surface-hover" />
            <div className="animate-shimmer ml-2 h-4 w-16 rounded bg-surface-hover" />
            <div className="animate-shimmer ml-auto h-4 w-20 rounded bg-surface-hover" />
            <div className="animate-shimmer ml-3 h-4 w-16 rounded bg-surface-hover" />
            <div className="animate-shimmer ml-3 h-8 w-8 rounded-full bg-surface-hover" />
          </nav>
          <main className="flex-1 space-y-3 p-6">
            <div className="animate-shimmer h-6 w-48 rounded bg-surface-hover" />
            <div className="animate-shimmer h-4 w-32 rounded bg-surface-hover" />
            <div className="animate-shimmer mt-6 h-14 w-full rounded-lg bg-surface-hover" />
            <div className="animate-shimmer h-14 w-full rounded-lg bg-surface-hover" />
            <div className="animate-shimmer h-14 w-full rounded-lg bg-surface-hover" />
          </main>
        </div>
      </ThemeProvider>
    );
  }

  if (!session) return null;

  return (
    <ThemeProvider>
      <LiveblocksProvider>
        <div className="flex min-h-svh flex-col bg-bg">
          <AppNav />
          <main className="flex-1">{children}</main>
        </div>
      </LiveblocksProvider>
    </ThemeProvider>
  );
}
