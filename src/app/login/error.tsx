"use client";

import { useEffect } from "react";

export default function LoginError({
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
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h2 className="text-lg font-medium text-ink">Sign-in unavailable</h2>
      <p className="mt-2 text-sm text-muted">Something went wrong. Please try signing in again.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-black transition-all hover:bg-primary-hover"
      >
        Try again
      </button>
    </div>
  );
}
