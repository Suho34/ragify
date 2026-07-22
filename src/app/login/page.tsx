"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/app",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
        <h1 className="mt-8 text-2xl font-light tracking-tight">
          Continue to <span className="font-semibold text-primary">RAGify</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign in with your Google account to get started.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          aria-busy={isSigningIn}
          className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface text-sm font-medium text-ink transition-all duration-200 ease-out hover:border-primary/30 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSigningIn ? (
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary"
              aria-hidden="true"
            />
          ) : (
            <FcGoogle className="h-5 w-5" aria-hidden="true" />
          )}
          {isSigningIn ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="mt-6 text-xs text-muted">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
