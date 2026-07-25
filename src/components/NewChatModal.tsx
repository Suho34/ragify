"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface DocItem {
  id: string;
  name: string;
  status: string;
}

export default function NewChatModal({
  documents,
  onClose,
}: {
  documents: DocItem[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const readyDocs = documents.filter((d) => d.status === "ready");

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds: [...selected],
          name: readyDocs
            .filter((d) => selected.has(d.id))
            .map((d) => d.name)
            .join(", ")
            .slice(0, 200),
        }),
      });
      if (res.ok) {
        const { chat } = await res.json();
        router.push(`/app/chat/${chat.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-ink">New Chat</h2>
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

          <p className="mb-4 text-xs text-muted">
            Select one or more documents to chat with:
          </p>

          {readyDocs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No documents ready yet. Upload a document first.
            </p>
          ) : (
            <div className="mb-4 max-h-60 space-y-1 overflow-y-auto">
              {readyDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => toggle(doc.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selected.has(doc.id)
                      ? "bg-primary-muted/30 ring-1 ring-primary/30"
                      : "hover:bg-surface"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selected.has(doc.id)
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {selected.has(doc.id) && (
                      <svg viewBox="0 0 16 16" fill="black" className="h-3 w-3">
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">{doc.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={selected.size === 0 || loading}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black transition-all hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? <Spinner className="mx-auto h-4 w-4" /> : `Chat with ${selected.size} document${selected.size !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
