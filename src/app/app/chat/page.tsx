"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Chat {
  id: string;
  name: string | null;
  documentId: string | null;
  createdAt: string;
}

function SkeletonRow() {
  return (
    <div className="flex animate-shimmer items-center justify-between rounded-lg px-3 py-3">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-48 rounded bg-surface-hover" />
        <div className="h-3 w-24 rounded bg-surface-hover" />
      </div>
      <div className="ml-3 h-7 w-7 rounded-md bg-surface-hover" />
    </div>
  );
}

export default function ChatList() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus();
  }, [renaming]);

  const handleRename = async (id: string) => {
    const name = renameValue.trim();
    if (!name) { setRenaming(null); return; }
    const res = await fetch(`/api/chats/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setRenaming(null);
    if (res.ok) fetchChats();
  };

  const fetchChats = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch("/api/chats", { signal });
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats);
        setError(null);
      } else if (res.status === 401 || res.status === 403) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load chats.");
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError("Could not load chats. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    const load = async () => { await fetchChats(abort.signal); };
    load();
    return () => abort.abort();
  }, [fetchChats]);

  const createChat = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Chat" }),
      });
      if (res.ok) {
        const { chat } = await res.json();
        router.push(`/app/chat/${chat.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/chats/${deleteTarget}`, { method: "DELETE" });
    setDeleteTarget(null);
    if (res.ok) fetchChats();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-ink">Chats</h1>
          <p className="mt-1 text-sm text-muted">
            Ask questions about your documents.
          </p>
        </div>
        <button
          onClick={createChat}
          disabled={creating}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black transition-all hover:bg-primary-hover disabled:opacity-50"
        >
          {creating ? "Creating..." : "New Chat"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button
            onClick={() => fetchChats()}
            className="ml-3 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="animate-stagger-in">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="h-12 w-12 text-muted/40 animate-float"
              aria-hidden="true"
            >
              <path d="M8 12h8M12 8v8" strokeLinecap="round" />
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <h2 className="mt-4 text-base font-medium text-ink">No chats yet</h2>
            <p className="mt-1 text-sm text-muted">
              Start a conversation about your documents.
            </p>
            <button
              onClick={createChat}
              className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-black transition-all hover:bg-primary-hover"
            >
              New Chat
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-stagger-in space-y-1">
          {chats.map((chat, i) => (
            <div
              key={chat.id}
              className="animate-stagger-in group flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-surface"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {renaming === chat.id ? (
                <div className="min-w-0 flex-1">
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(chat.id);
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    onBlur={() => handleRename(chat.id)}
                    className="w-full rounded border border-border bg-surface px-2 py-1 text-sm font-medium text-ink outline-none focus:border-primary"
                  />
                  <p className="mt-0.5 text-xs text-muted">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="group/name flex min-w-0 flex-1 items-center gap-2">
                  <Link href={`/app/chat/${chat.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {chat.name || "Untitled Chat"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setRenaming(chat.id);
                      setRenameValue(chat.name || "");
                    }}
                    className="shrink-0 rounded p-1 text-muted opacity-0 transition-all hover:text-ink group-hover/name:opacity-100"
                    title="Rename chat"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L3.988 10.571a.25.25 0 00-.064.108l-.648 2.27 2.27-.648a.25.25 0 00.108-.064l8.61-8.61a.25.25 0 000-.353l-1.086-1.086z" />
                    </svg>
                  </button>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setDeleteTarget(chat.id);
                }}
                className="ml-3 rounded-md p-1.5 text-muted opacity-60 transition-all hover:bg-red-500/10 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                title="Delete chat"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
