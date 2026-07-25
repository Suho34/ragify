import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.chatRoom.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ chats });
  } catch {
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.slice(0, 200) : null;
    const documentId = typeof body.documentId === "string" ? body.documentId : null;
    const documentIds = Array.isArray(body.documentIds) ? body.documentIds.filter((id: any) => typeof id === "string") : [];

    if (documentId) {
      const doc = await prisma.document.findUnique({ where: { id: documentId } });
      if (!doc || doc.userId !== session.user.id) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
    }

    if (documentIds.length > 0) {
      const docs = await prisma.document.findMany({
        where: { id: { in: documentIds }, userId: session.user.id },
        select: { id: true },
      });
      if (docs.length !== documentIds.length) {
        return NextResponse.json({ error: "One or more documents not found" }, { status: 404 });
      }
    }

    const allDocIds = documentId
      ? [documentId, ...documentIds.filter((id: string) => id !== documentId)]
      : documentIds;

    const chat = await prisma.chatRoom.create({
      data: {
        userId: session.user.id,
        name,
        documentId: allDocIds[0] || null,
        documents: allDocIds.length > 0 ? {
          create: allDocIds.map((id: string) => ({ documentId: id })),
        } : undefined,
      },
    });

    return NextResponse.json({ chat });
  } catch {
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
