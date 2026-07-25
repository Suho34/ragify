import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const room = await prisma.chatRoom.findUnique({ where: { id } });
  if (!room) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const links = await prisma.chatRoomDocument.findMany({
    where: { chatRoomId: id },
    include: { document: { select: { id: true, name: true } } },
  });

  const docList = links.map((l) => l.document);

  if (room.documentId && !docList.some((d) => d.id === room.documentId)) {
    const legacyDoc = await prisma.document.findUnique({
      where: { id: room.documentId },
      select: { id: true, name: true },
    });
    if (legacyDoc) docList.unshift(legacyDoc);
  }

  return NextResponse.json({ documents: docList });
}
