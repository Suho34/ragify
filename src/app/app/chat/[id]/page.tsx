"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { use } from "react";
import { TextStreamChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { authClient } from "@/lib/auth-client";
import { RoomProvider, useMyPresence, useOthers, useSelf, useEventListener } from "@liveblocks/react";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputProvider,
} from "@/components/ai-elements/prompt-input";
import { useSlashCommand } from "@/components/SlashCommandMenu";
import Link from "next/link";

interface DbMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  userName?: string | null;
}

function getText(msg: { parts?: { type: string; text?: string }[] }): string {
  return msg.parts?.filter((p) => p.type === "text").map((p) => p.text).join("") ?? "";
}

function Avatar({ name, size = "sm" }: { name: string | undefined; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const text = size === "sm" ? "text-[10px]" : "text-xs";
  const displayName = name ?? "Guest";
  const initials = displayName === "Guest" ? "G" : displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  return (
    <span className={`${dim} flex items-center justify-center rounded-full bg-primary-muted ${text} font-medium text-primary border border-primary/20`}>
      {initials}
    </span>
  );
}

function PresenceAvatars() {
  const self = useSelf();
  const others = useOthers();
  if (!self) return null;
  const selfInfo = self.info as { name?: string } | undefined;
  return (
    <div className="flex items-center -space-x-1.5">
      <Avatar name={selfInfo?.name} />
      {others.map((other) => {
        const otherInfo = other.info as { name?: string } | undefined;
        return (
          <div key={other.id} className="relative">
            <Avatar name={otherInfo?.name} />
          </div>
        );
      })}
    </div>
  );
}

function OthersCursors() {
  const others = useOthers();
  return (
    <>
      {others.map((other: any) => {
        const cursor = other.presence?.cursor;
        if (!cursor || typeof cursor !== "object") return null;
        const otherInfo = other.info as { name?: string } | undefined;
        return (
          <div
            key={other.id}
            className="pointer-events-none fixed z-50 flex items-center gap-1.5"
            style={{ left: (cursor as any).x, top: (cursor as any).y }}
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className="drop-shadow">
              <path d="M1 1L9.5 9.5H5.5L4 14L1 1Z" fill="color-mix(in srgb, var(--color-primary) 60%, transparent)" />
            </svg>
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary whitespace-nowrap">
              {otherInfo?.name ?? "Guest"}
            </span>
          </div>
        );
      })}
    </>
  );
}

function ChatRoom({
  id,
  chatName,
  initialMessages,
  initialSenderNames = {},
  linkedDocs = [],
}: {
  id: string;
  chatName: string;
  initialMessages: any[];
  initialSenderNames?: Record<string, string>;
  linkedDocs?: { id: string; name: string }[];
}) {
  const { data: session } = authClient.useSession();
  const isGuest = !session?.user;
  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id,
    messages: initialMessages,
    transport: new TextStreamChatTransport({
      api: `/api/chats/${id}/messages`,
    }),
  });

  const senderNamesRef = useRef<Record<string, string>>(initialSenderNames);
  const currentUserName = session?.user?.name ?? "You";
  const isBusy = status === "streaming" || status === "submitted";
  const seenContent = useRef<Set<string>>(
    new Set(initialMessages.map((m: any) => `${m.role}:${getText(m)}`))
  );

  useEventListener((event: any) => {
    if (event?.type === "new-message") {
      const msg = event.message;
      if (!msg?.id) return;
      const fp = `${msg.role}:${msg.content}`;
      if (seenContent.current.has(fp)) return;
      seenContent.current.add(fp);
      if (msg.userName) {
        senderNamesRef.current[msg.id] = msg.userName;
      }
      setMessages((prev) => [...prev, { id: msg.id, role: msg.role, parts: [{ type: "text", text: msg.content }] }]);
    }
  });

  useEffect(() => {
    if (isBusy) return;
    const abort = new AbortController();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chats/${id}/messages`, { signal: abort.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.messages) return;
        for (const msg of data.messages) {
          const fp = `${msg.role}:${msg.content}`;
          if (seenContent.current.has(fp)) continue;
          seenContent.current.add(fp);
          setMessages((prev) => [...prev, { id: msg.id, role: msg.role, parts: [{ type: "text", text: msg.content }] }]);
        }
      } catch {}
    }, 4000);
    return () => { clearInterval(interval); abort.abort(); };
  }, [id, isBusy, setMessages]);

  const [, updateMyPresence] = useMyPresence();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } } as any);
    },
    [updateMyPresence],
  );

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null } as any);
  }, [updateMyPresence]);

  const handleSubmit = useCallback(
    (message: { text: string }) => {
      if (!message.text.trim() || isBusy) return;
      sendMessage({ text: message.text });
    },
    [isBusy, sendMessage],
  );

  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/app/chat/${id}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [id]);

  return (
    <div
      className="mx-auto flex h-[calc(100svh-56px)] max-w-4xl flex-col px-4 sm:px-6"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <header className="border-b border-border py-3">
        <div className="flex items-center gap-3">
          <Link href="/app/chat" className="group/link text-sm text-muted hover:text-ink shrink-0">
            <span className="inline-block transition-transform duration-200 group-hover/link:-translate-x-0.5">&larr;</span> Chats
          </Link>
          <span className="text-sm font-medium text-ink truncate">{chatName}</span>
          {isGuest && (
            <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[10px] font-medium text-muted uppercase tracking-wider">Guest</span>
          )}
          <div className="ml-auto flex items-center gap-3">
            <PresenceAvatars />
            <button
              onClick={handleCopyLink}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-all hover:bg-surface hover:text-ink"
            >
              {linkCopied ? (
                <span className="inline-flex items-center gap-1">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-primary" aria-hidden="true">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                  </svg>
                  Copied!
                </span>
              ) : "Copy room link"}
              {linkCopied && <span className="sr-only" role="status">Room link copied to clipboard</span>}
            </button>
          </div>
        </div>
        {linkedDocs.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {linkedDocs.map((doc) => (
              <span
                key={doc.id}
                className="inline-flex items-center gap-1 rounded-md bg-primary-muted/20 px-2 py-0.5 text-[10px] font-medium text-primary"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                  <path d="M2 2.5A1.5 1.5 0 013.5 1h5.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0114 5.622V13.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 13.5V2.5z" />
                </svg>
                {doc.name}
              </span>
            ))}
          </div>
        )}
      </header>

      <OthersCursors />

      <Conversation>
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24">
              <h2 className="text-base font-medium text-ink">Ask a question</h2>
              <p className="mt-1 text-sm text-muted">
                Ask anything about your document.
              </p>
            </div>
          )}

          {messages.map((msg: any, i: number) => {
            const isUser = msg.role === "user";
            const senderName = isUser
              ? (senderNamesRef.current[msg.id] ?? currentUserName)
              : "RAGify AI";
            return (
              <Message key={msg.id} from={msg.role} className="animate-stagger-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="mb-1 flex items-center gap-1.5">
                  <Avatar name={senderName} size="sm" />
                  <span className="max-w-[200px] truncate text-[11px] text-muted">{senderName}</span>
                </div>
                <MessageContent>
                  {isUser ? (
                    <p className="break-words text-sm">{getText(msg)}</p>
                  ) : (
                    <MessageResponse className="break-words">{getText(msg)}</MessageResponse>
                  )}
                </MessageContent>
              </Message>
            );
          })}

          {(status === "submitted" || (status === "streaming" && getText(messages[messages.length - 1]) === "")) && (
            <Message from="assistant">
              <MessageContent>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-shimmer" />
                  Thinking
                </div>
              </MessageContent>
            </Message>
          )}

          {status === "error" && (
            <div className="flex items-center justify-center py-4">
              <span className="text-sm text-destructive">Message failed to send. Try again.</span>
            </div>
          )}
        </ConversationContent>
      </Conversation>

      <div className="border-t border-border py-4">
        <label htmlFor="chat-input" className="sr-only">Ask a question</label>
        <PromptInputProvider>
          <SlashChatInput handleSubmit={handleSubmit} status={status} stop={stop} />
        </PromptInputProvider>
      </div>
    </div>
  );
}

function SlashChatInput({
  handleSubmit,
  status,
  stop,
}: {
  handleSubmit: (message: { text: string }) => void;
  status: string;
  stop: () => void;
}) {
  const { menu, handleKeyDown } = useSlashCommand();
  return (
    <div className="relative">
      {menu}
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea placeholder='Ask anything... ("/" for commands)' id="chat-input" onKeyDown={handleKeyDown} />
        <PromptInputSubmit status={status as any} onStop={stop} className="rounded-lg transition-all active:scale-90" />
      </PromptInput>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto flex h-[calc(100svh-56px)] max-w-4xl flex-col px-4 sm:px-6">
      <div className="flex animate-shimmer items-center gap-3 border-b border-border py-3">
        <div className="h-4 w-16 rounded bg-surface-hover" />
        <div className="h-4 w-40 rounded bg-surface-hover" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-surface-hover" />
          <div className="h-7 w-7 rounded-full bg-surface-hover" />
          <div className="h-7 w-28 rounded-lg bg-surface-hover" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-8 p-4">
        <div className="animate-stagger-in flex flex-col gap-2 max-w-[70%] ml-auto" style={{ animationDelay: "0ms" }}>
          <div className="flex animate-shimmer items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-surface-hover" />
            <div className="h-3 w-16 rounded bg-surface-hover" />
          </div>
          <div className="animate-shimmer rounded-lg bg-surface px-4 py-3">
            <div className="h-3 w-48 rounded bg-surface-hover" />
            <div className="mt-2 h-3 w-36 rounded bg-surface-hover" />
          </div>
        </div>
        <div className="animate-stagger-in flex flex-col gap-2 max-w-[80%]" style={{ animationDelay: "100ms" }}>
          <div className="flex animate-shimmer items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-surface-hover" />
            <div className="h-3 w-20 rounded bg-surface-hover" />
          </div>
          <div className="animate-shimmer">
            <div className="h-3 w-64 rounded bg-surface-hover" />
            <div className="mt-2 h-3 w-full rounded bg-surface-hover" />
            <div className="mt-2 h-3 w-44 rounded bg-surface-hover" />
          </div>
        </div>
        <div className="animate-stagger-in flex flex-col gap-2 max-w-[75%]" style={{ animationDelay: "200ms" }}>
          <div className="flex animate-shimmer items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-surface-hover" />
            <div className="h-3 w-14 rounded bg-surface-hover" />
          </div>
          <div className="animate-shimmer">
            <div className="h-3 w-56 rounded bg-surface-hover" />
            <div className="mt-2 h-3 w-40 rounded bg-surface-hover" />
            <div className="mt-2 h-3 w-60 rounded bg-surface-hover" />
            <div className="mt-2 h-3 w-32 rounded bg-surface-hover" />
          </div>
        </div>
      </div>
      <div className="animate-shimmer border-t border-border py-4">
        <div className="mx-auto h-10 max-w-full rounded-lg bg-surface" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex h-[calc(100svh-56px)] max-w-4xl flex-col items-center justify-center px-4">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-center">
        <p className="text-sm text-destructive">{message}</p>
        <div className="mt-4 flex gap-3 justify-center">
          <button onClick={onRetry} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary-hover">
            Retry
          </button>
          <Link href="/app/chat" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface">
            Go back to chats
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = authClient.useSession();
  const [chatName, setChatName] = useState("");
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [linkedDocs, setLinkedDocs] = useState<{ id: string; name: string }[]>([]);
  const initialSenderNames = useRef<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setFetchError(null);
    const results = await Promise.allSettled([
      fetch(`/api/chats/${id}`, { signal })
        .then((r) => {
          if (r.ok) return r.json();
          if (r.status === 404) throw new Error("Chat not found.");
          if (r.status === 401 || r.status === 403) throw new Error("Session expired.");
          throw new Error("Failed to load chat.");
        })
        .then((d) => {
          if (d?.chat) setChatName(d.chat.name || "Untitled Chat");
        }),
      fetch(`/api/chats/${id}/messages`, { signal })
        .then((r) => {
          if (r.ok) return r.json();
          if (r.status === 404) throw new Error("Chat not found. It may have been deleted.");
          throw new Error("Failed to load messages.");
        })
        .then((d) => {
          if (d?.messages) {
            const names: Record<string, string> = {};
            for (const m of d.messages) {
              if (m.userName) {
                names[m.id] = m.userName;
              }
            }
            initialSenderNames.current = names;
            setInitialMessages(
              d.messages.map((m: DbMessage) => ({
                id: m.id,
                role: m.role,
                parts: [{ type: "text", text: m.content }],
              })),
            );
          }
        }),
      fetch(`/api/chats/${id}/documents`, { signal })
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (d?.documents) setLinkedDocs(d.documents);
        }),
    ]);
    const errors = results.filter(
      (r) => r.status === "rejected" && (r.reason as Error)?.name !== "AbortError"
    ) as PromiseRejectedResult[];
    if (errors.length > 0) {
      const messages = errors.map((e) => (e.reason as Error)?.message).filter(Boolean);
      setFetchError(messages[0] || "Chat could not be loaded.");
    }
    setReady(true);
  }, [id]);

  useEffect(() => {
    const abort = new AbortController();
    loadData(abort.signal);
    return () => abort.abort();
  }, [loadData, retryCount]);

  if (fetchError) {
    return <ErrorState message={fetchError} onRetry={() => { setReady(false); setRetryCount((c) => c + 1); }} />;
  }

  if (!ready) {
    return <LoadingSkeleton />;
  }

  const userName = session?.user?.name ?? "Guest";
  const userAvatar = session?.user?.image ?? null;

  return (
    <RoomProvider
      id={id}
      initialPresence={{
        name: userName,
        avatarUrl: userAvatar,
        cursor: null,
      }}
    >
      <ChatRoom id={id} chatName={chatName} initialMessages={initialMessages} initialSenderNames={initialSenderNames.current} linkedDocs={linkedDocs} />
    </RoomProvider>
  );
}
