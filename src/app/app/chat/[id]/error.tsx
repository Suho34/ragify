"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ChatRoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h2 className="text-lg font-medium text-ink">Chat room error</h2>
      <p className="mt-2 text-sm text-muted">Could not load this chat room.</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-black transition-all hover:bg-primary-hover"
        >
          Try again
        </button>
        <Link
          href="/app/chat"
          className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
        >
          Back to chats
        </Link>
      </div>
    </div>
  );
}
