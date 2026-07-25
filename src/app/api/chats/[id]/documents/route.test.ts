import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    chatRoom: {
      findUnique: vi.fn(),
    },
    chatRoomDocument: {
      findMany: vi.fn(),
    },
    document: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET } from "./route";

function mockRequest(url: string): Request {
  return { url } as unknown as Request;
}

describe("GET /api/chats/[id]/documents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 if chat room does not exist", async () => {
    vi.mocked(prisma.chatRoom.findUnique).mockResolvedValue(null);
    const res = await GET(mockRequest("http://localhost/api/chats/bad-id/documents"), {
      params: Promise.resolve({ id: "bad-id" }),
    } as any);
    expect(res.status).toBe(404);
  });

  it("returns linked documents for a room", async () => {
    vi.mocked(prisma.chatRoom.findUnique).mockResolvedValue({ id: "chat-1", documentId: null } as any);
    vi.mocked(prisma.chatRoomDocument.findMany).mockResolvedValue([
      { document: { id: "doc-1", name: "Doc 1" } },
      { document: { id: "doc-2", name: "Doc 2" } },
    ] as any);

    const res = await GET(mockRequest("http://localhost/api/chats/chat-1/documents"), {
      params: Promise.resolve({ id: "chat-1" }),
    } as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.documents).toHaveLength(2);
  });

  it("includes legacy documentId if not in join table", async () => {
    vi.mocked(prisma.chatRoom.findUnique).mockResolvedValue({
      id: "chat-1",
      documentId: "legacy-doc",
    } as any);
    vi.mocked(prisma.chatRoomDocument.findMany).mockResolvedValue([
      { document: { id: "doc-1", name: "Doc 1" } },
    ] as any);
    vi.mocked(prisma.document.findUnique).mockResolvedValue({
      id: "legacy-doc",
      name: "Legacy Doc",
    } as any);

    const res = await GET(mockRequest("http://localhost/api/chats/chat-1/documents"), {
      params: Promise.resolve({ id: "chat-1" }),
    } as any);
    const data = await res.json();
    expect(data.documents).toHaveLength(2);
    expect(data.documents[0].id).toBe("legacy-doc");
  });
});
