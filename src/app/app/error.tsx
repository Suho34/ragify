"use client";

import { useEffect } from "react";

export default function AppError({
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
      <h2 className="text-lg font-medium text-ink">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-black transition-all hover:bg-primary-hover"
      >
        Try again
      </button>
    </div>
  );
}
