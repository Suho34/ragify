"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import UploadZone from "@/components/UploadZone";
import Tour from "@/components/Tour";
import DocumentInsightsPanel from "@/components/DocumentInsightsPanel";
import NewChatModal from "@/components/NewChatModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Document {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  chunksTotal: number | null;
  chunksProcessed: number | null;
}

function DeleteIcon() {
  return (
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
  );
}

function SkeletonRow() {
  return (
    <div className="flex animate-shimmer items-center justify-between rounded-lg px-3 py-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-md bg-surface-hover" />
        <div className="min-w-0 space-y-2">
          <div className="h-4 w-48 rounded bg-surface-hover" />
          <div className="h-3 w-24 rounded bg-surface-hover" />
        </div>
      </div>
      <div className="ml-4 flex items-center gap-3">
        <div className="h-6 w-14 rounded-lg bg-surface-hover" />
        <div className="h-5 w-5 rounded bg-surface-hover" />
      </div>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  uploading: "Uploading...",
  processing: "Processing...",
  ready: "Ready",
  error: "Error",
};

const statusColors: Record<string, string> = {
  uploading: "text-muted",
  processing: "text-accent",
  ready: "text-primary",
  error: "text-destructive",
};

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [chatLoading, setChatLoading] = useState<string | null>(null);
  const [insightDocId, setInsightDocId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const hasProcessingRef = useRef(false);

  const fetchDocs = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/documents", { signal });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
        setError(null);
      } else if (res.status === 401 || res.status === 403) {
        setError("Session expired. Please log in again.");
      } else if (res.status === 429) {
        setError("Too many requests. Please wait a moment.");
      } else {
        setError("Failed to load documents.");
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError("Could not load documents. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    const loadDocuments = async () => {
      await fetchDocs(abort.signal);
    };
    loadDocuments();
    return () => abort.abort();
  }, [fetchDocs]);

  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "processing");
    hasProcessingRef.current = hasProcessing;
    if (!hasProcessing) return;
    const interval = setInterval(() => {
      if (hasProcessingRef.current) {
        fetchDocs();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchDocs, documents]);

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchDocs();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/documents/${deleteTarget.id}`, {
      method: "DELETE",
    });
    setDeleteTarget(null);
    if (res.ok) fetchDocs();
  };

  const handleChat = async (docId: string, docName: string) => {
    setChatLoading(docId);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId, name: docName }),
      });
      if (res.ok) {
        const { chat } = await res.json();
        router.push(`/app/chat/${chat.id}`);
      }
    } finally {
      setChatLoading(null);
    }
  };

  const hasContent = documents.length > 0;
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("ragify-onboarding-seen");
    if (!seen) setShowOnboarding(true);
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("ragify-onboarding-seen", "1");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {showOnboarding && (
        <div className="relative mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary-muted/30 px-6 py-5">
          <button
            onClick={dismissOnboarding}
            className="absolute right-3 top-3 rounded p-1 text-muted transition-colors hover:text-ink"
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path d="M4.22 4.22a.75.75 0 011.06 0L8 6.94l2.72-2.72a.75.75 0 111.06 1.06L9.06 8l2.72 2.72a.75.75 0 11-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 01-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 010-1.06z" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-ink">Welcome to RAGify</h2>
          <p className="mt-1 text-xs text-muted">
            Here&apos;s how to get started in 3 steps:
          </p>
          <ol className="mt-3 flex flex-col gap-2 text-xs text-muted sm:flex-row sm:gap-6">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">
                1
              </span>
              Upload a PDF document
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">
                2
              </span>
              Ask questions with RAG accuracy
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">
                3
              </span>
              Share the room with friends
            </li>
          </ol>
        </div>
      )}

      <Tour />

      <div data-tour="welcome" className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-ink">
            Welcome back
            {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">Pick up where you left off.</p>
        </div>
        <div className="flex items-center gap-3">
          {documents.some((d) => d.status === "ready") && (
            <button
              data-tour="new-chat-btn"
              onClick={() => setShowNewChat(true)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
            >
              New Chat
            </button>
          )}
          <button
            data-tour="upload-btn"
            onClick={() => setShowUpload(!showUpload)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black transition-all hover:bg-primary-hover"
          >
            {showUpload ? "Cancel" : "Upload PDF"}
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="mb-8">
          <UploadZone onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button
            onClick={() => fetchDocs()}
            className="ml-3 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-surface-hover animate-pulse" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : !hasContent && !showUpload ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="h-12 w-12 text-muted/40 animate-float"
            aria-hidden="true"
          >
            <path d="M12 16v-4m0 0V8m0 4H8m4 0h4" strokeLinecap="round" />
            <path d="M4 6.5V4a2 2 0 012-2h8.5L20 7.5V20a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
          </svg>
          <h2 className="mt-4 text-base font-medium text-ink">
            Upload your first document
          </h2>
          <p className="mt-1 text-sm text-muted">Drop a PDF to get started.</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-black transition-all hover:bg-primary-hover"
          >
            Upload document
          </button>
        </div>
      ) : (
        <section className="animate-stagger-in" data-tour="doc-list">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-medium text-ink">Recent Documents</h2>
            <span className="text-xs text-muted">{documents.length}</span>
          </div>
          <div className="space-y-1">
            {documents.map((doc, i) => (
              <div
                key={doc.id}
                data-tour={i === 0 ? "doc-row" : undefined}
                className="animate-stagger-in flex cursor-pointer items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-surface"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setInsightDocId(doc.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-[10px] font-medium text-muted">
                    PDF
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {doc.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  {doc.status === "ready" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChat(doc.id, doc.name);
                      }}
                      disabled={chatLoading === doc.id}
                      className="rounded-lg bg-primary-muted px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/30"
                    >
                      {chatLoading === doc.id ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        "Chat"
                      )}
                    </button>
                  )}
                  <span
                    className={`text-xs ${statusColors[doc.status] || "text-muted"}`}
                  >
                    {doc.status === "processing" && doc.chunksTotal
                      ? `${doc.chunksProcessed ?? 0}/${doc.chunksTotal} chunks`
                      : statusLabels[doc.status] || doc.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ id: doc.id, name: doc.name });
                    }}
                    className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-destructive"
                    title="Delete document"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showNewChat && (
        <NewChatModal
          documents={documents}
          onClose={() => setShowNewChat(false)}
        />
      )}

      <DocumentInsightsPanel
        documentId={insightDocId}
        onClose={() => setInsightDocId(null)}
        onStartChat={handleChat}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document</DialogTitle>
            <DialogDescription className="wrap-break-word">
              Are you sure you want to delete &ldquo;{deleteTarget?.name}
              &rdquo;? This action cannot be undone.
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
