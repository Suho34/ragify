"use client";

import { LiveblocksProvider as LiveblocksProviderBase } from "@liveblocks/react";

export function LiveblocksProvider({ children }: { children: React.ReactNode }) {
  return (
    <LiveblocksProviderBase authEndpoint="/api/liveblocks" throttle={16}>
      {children}
    </LiveblocksProviderBase>
  );
}
