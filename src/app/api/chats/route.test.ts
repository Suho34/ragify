import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth early
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    chatRoom: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    document: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers()),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "./route";

function mockRequest(method: string, body?: unknown): Request {
  return {
    method,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Request;
}

describe("GET /api/chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns chats for authenticated user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.chatRoom.findMany).mockResolvedValue([
      { id: "chat-1", name: "Test Chat" },
    ] as any);

    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.chats).toHaveLength(1);
  });
});

describe("POST /api/chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await POST(mockRequest("POST", { name: "Test" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    const res = await POST(mockRequest("POST", null));
    expect(res.status).toBe(400);
  });

  it("returns 404 when documentId does not exist", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.document.findUnique).mockResolvedValue(null);
    const res = await POST(
      mockRequest("POST", { name: "Chat", documentId: "bad-id" })
    );
    expect(res.status).toBe(404);
  });

  it("creates a chat with valid data", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.chatRoom.create).mockResolvedValue({
      id: "chat-1",
      name: "My Chat",
    } as any);
    const res = await POST(mockRequest("POST", { name: "My Chat" }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.chat.name).toBe("My Chat");
  });

  it("creates a multi-document chat with documentIds array", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.document.findMany).mockResolvedValue([
      { id: "doc-1" },
      { id: "doc-2" },
    ] as any);
    vi.mocked(prisma.chatRoom.create).mockResolvedValue({
      id: "chat-1",
      name: "Multi-doc Chat",
    } as any);

    const res = await POST(
      mockRequest("POST", { name: "Multi-doc Chat", documentIds: ["doc-1", "doc-2"] })
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.chat.name).toBe("Multi-doc Chat");
    expect(prisma.chatRoom.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documents: expect.objectContaining({
            create: [{ documentId: "doc-1" }, { documentId: "doc-2" }],
          }),
        }),
      })
    );
  });

  it("returns 404 when one document in documentIds is not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.document.findMany).mockResolvedValue([{ id: "doc-1" }] as any);
    const res = await POST(
      mockRequest("POST", { name: "Chat", documentIds: ["doc-1", "doc-2"] })
    );
    expect(res.status).toBe(404);
  });
});
