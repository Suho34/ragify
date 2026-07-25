import { createUploadthing, type FileRouter } from "uploadthing/next";
import { waitUntil } from "@vercel/functions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processPdf } from "@/lib/process-pdf";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const doc = await prisma.document.create({
        data: {
          userId: metadata.userId,
          name: file.name,
          url: file.ufsUrl,
          fileSize: file.size,
          status: "processing",
        },
      });

      waitUntil(
        processPdf(doc.id, file.ufsUrl).catch(async (err) => {
          console.error("PDF processing failed:", err);
          await prisma.document.update({
            where: { id: doc.id },
            data: { status: "error" },
          });
        })
      );
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
