"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface ChatRoomInfo {
  id: string;
  name: string | null;
  createdAt: string;
}

interface DocumentInfo {
  id: string;
  name: string;
  status: string;
  wordCount: number | null;
  estimatedReadingTime: number | null;
  fileSize: number | null;
  chunksTotal: number | null;
  chunksProcessed: number | null;
  createdAt: string;
  chatCount: number;
  chatRooms: ChatRoomInfo[];
}

export default function DocumentInsightsPanel({
  documentId,
  onClose,
  onStartChat,
}: {
  documentId: string | null;
  onClose: () => void;
  onStartChat: (docId: string, docName: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<DocumentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/documents/${documentId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load document details");
        return r.json();
      })
      .then((data) => setDoc(data.document))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [documentId]);

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "—";
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  if (!documentId) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed bottom-0 right-0 top-[56px] z-50 w-full max-w-md border-l border-border bg-background p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-medium text-ink">Document Details</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted transition-colors hover:bg-surface hover:text-ink"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path d="M4.22 4.22a.75.75 0 011.06 0L8 6.94l2.72-2.72a.75.75 0 111.06 1.06L9.06 8l2.72 2.72a.75.75 0 11-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 01-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 010-1.06z" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-5 w-5" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : doc ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-ink break-words">{doc.name}</h3>
              <p className="mt-1 text-xs text-muted">
                Uploaded {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted uppercase tracking-wider">Status</p>
                <p className="mt-0.5 text-sm font-medium text-ink capitalize">{doc.status}</p>
              </div>
              <div className="rounded-lg border border-border px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted uppercase tracking-wider">Size</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{formatBytes(doc.fileSize)}</p>
              </div>
              <div className="rounded-lg border border-border px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted uppercase tracking-wider">Words</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{doc.wordCount?.toLocaleString() ?? "—"}</p>
              </div>
              <div className="rounded-lg border border-border px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted uppercase tracking-wider">Reading Time</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{formatTime(doc.estimatedReadingTime)}</p>
              </div>
            </div>

            {doc.status === "processing" && doc.chunksTotal && (
              <div>
                <p className="mb-1.5 text-xs text-muted">
                  Processing chunks: {doc.chunksProcessed ?? 0}/{doc.chunksTotal}
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${((doc.chunksProcessed ?? 0) / doc.chunksTotal) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onStartChat(doc.id, doc.name)}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black transition-all hover:bg-primary-hover"
              >
                Chat with document
              </button>
            </div>

            {doc.chatRooms.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted uppercase tracking-wider">
                  Chat Rooms ({doc.chatCount})
                </p>
                <div className="space-y-1">
                  {doc.chatRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => router.push(`/app/chat/${room.id}`)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-muted">
                        <path d="M2 2.5A1.5 1.5 0 013.5 1h5.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0114 5.622V13.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 13.5V2.5z" />
                      </svg>
                      <span className="truncate">{room.name || "Untitled Chat"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
