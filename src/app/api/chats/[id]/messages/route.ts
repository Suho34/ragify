import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Liveblocks } from "@liveblocks/node";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const room = await prisma.chatRoom.findUnique({ where: { id } });
  if (!room) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { roomId: id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      userId: m.userId,
      userName: m.role === "user" ? (m.user?.name ?? null) : null,
    })),
  });
}

async function embedContent(text: string): Promise<number[]> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  const { id } = await params;
  const room = await prisma.chatRoom.findUnique({ where: { id } });
  if (!room) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { messages } = await req.json();
  const lastMsg = messages?.[messages?.length - 1];
  const userContent =
    lastMsg?.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("") || lastMsg?.content;
  if (!userContent || typeof userContent !== "string") {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const isGuest = !session?.user;
  const userMessage = await prisma.chatMessage.create({
    data: {
      roomId: id,
      userId: session?.user?.id ?? null,
      guestId: isGuest ? `guest-${crypto.randomUUID()}` : null,
      role: "user",
      content: userContent,
    },
  });

  try {
    await liveblocks.broadcastEvent(id, {
      type: "new-message",
      message: {
        id: userMessage.id,
        role: "user",
        content: userContent,
        createdAt: userMessage.createdAt.toISOString(),
        userId: session?.user?.id ?? null,
        userName: session?.user?.name ?? "Guest",
      },
    });
  } catch {}

  const roomDocs = await prisma.chatRoomDocument.findMany({
    where: { chatRoomId: id },
    select: { documentId: true },
  });
  const docIds = [room.documentId, ...roomDocs.map((d) => d.documentId)].filter(Boolean) as string[];

  const previousMessages = await prisma.chatMessage.findMany({
    where: { roomId: id, role: { not: "user" } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  let systemPrompt = "You are a helpful assistant.";
  if (docIds.length > 0) {
    const queryEmbedding = await embedContent(userContent);
    const chunks = await prisma.documentChunk.findMany({
      where: { documentId: { in: docIds } },
      select: { content: true, embedding: true, chunkIndex: true, documentId: true },
    });
    const scored = chunks
      .filter((c) => c.embedding)
      .map((c) => ({
        content: c.content,
        score: cosineSimilarity(queryEmbedding, c.embedding as number[]),
        documentId: c.documentId,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    const context = scored
      .map((c, i) => `[${i + 1}] ${c.content}`)
      .join("\n\n");
    systemPrompt = `You are a helpful assistant answering questions based on the provided document context.\nContext from the document(s):\n${context}`;
  }

  const history = previousMessages
    .reverse()
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const result = streamText({
    model: google("gemini-3.1-flash-lite"),
    system: systemPrompt,
    messages: [
      ...(history ? [{ role: "assistant" as const, content: history }] : []),
      { role: "user" as const, content: userContent },
    ],
    onFinish: async ({ text }) => {
      const assistantMessage = await prisma.chatMessage.create({
        data: {
          roomId: id,
          role: "assistant",
          content: text,
        },
      });
      try {
        await liveblocks.broadcastEvent(id, {
          type: "new-message",
          message: {
            id: assistantMessage.id,
            role: "assistant",
            content: text,
            createdAt: assistantMessage.createdAt.toISOString(),
          },
        });
      } catch {}
    },
  });

  return result.toTextStreamResponse();
}
