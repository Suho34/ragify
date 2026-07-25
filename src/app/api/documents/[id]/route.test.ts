import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    chatRoom: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers()),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET, DELETE } from "./route";

describe("GET /api/documents/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await GET({} as Request, {
      params: Promise.resolve({ id: "doc-1" }),
    } as any);
    expect(res.status).toBe(401);
  });

  it("returns 404 if document not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.document.findUnique).mockResolvedValue(null);
    const res = await GET({} as Request, {
      params: Promise.resolve({ id: "bad-id" }),
    } as any);
    expect(res.status).toBe(404);
  });

  it("returns 403 if document belongs to another user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.document.findUnique).mockResolvedValue({
      id: "doc-1",
      userId: "user-2",
    } as any);
    const res = await GET({} as Request, {
      params: Promise.resolve({ id: "doc-1" }),
    } as any);
    expect(res.status).toBe(403);
  });

  it("returns document with insights", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.document.findUnique).mockResolvedValue({
      id: "doc-1",
      name: "Test Doc",
      status: "ready",
      wordCount: 1500,
      estimatedReadingTime: 5,
      fileSize: 102400,
      chunksTotal: 10,
      chunksProcessed: 10,
      userId: "user-1",
      createdAt: new Date("2025-01-01"),
      _count: { chatRooms: 2 },
    } as any);
    vi.mocked(prisma.chatRoom.findMany).mockResolvedValue([
      { id: "room-1", name: "Chat Room 1", createdAt: new Date("2025-01-01") },
    ] as any);

    const res = await GET({} as Request, {
      params: Promise.resolve({ id: "doc-1" }),
    } as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.document.wordCount).toBe(1500);
    expect(data.document.estimatedReadingTime).toBe(5);
    expect(data.document.fileSize).toBe(102400);
    expect(data.document.chatRooms).toHaveLength(1);
  });
});

describe("DELETE /api/documents/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await DELETE({} as Request, {
      params: Promise.resolve({ id: "doc-1" }),
    } as any);
    expect(res.status).toBe(401);
  });

  it("returns 404 if document not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.document.findUnique).mockResolvedValue(null);
    const res = await DELETE({} as Request, {
      params: Promise.resolve({ id: "bad-id" }),
    } as any);
    expect(res.status).toBe(404);
  });

  it("deletes document owned by user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as any);
    vi.mocked(prisma.document.findUnique).mockResolvedValue({
      id: "doc-1",
      userId: "user-1",
    } as any);
    vi.mocked(prisma.document.delete).mockResolvedValue({} as any);

    const res = await DELETE({} as Request, {
      params: Promise.resolve({ id: "doc-1" }),
    } as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
