import { prisma } from "@/lib/prisma";
import { embedMany } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import PDFParser from "pdf2json";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const embeddingModel = openrouter.embedding("nvidia/nemotron-3-embed-1b:free");
const BATCH_SIZE = 256;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function chunkText(text: string, targetTokens = 2000, overlapTokens = 100): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;

  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para);

    if (currentTokens + paraTokens > targetTokens && current.length > 0) {
      chunks.push(current.join("\n\n"));
      const overlap: string[] = [];
      let overlapTokensCount = 0;
      for (let i = current.length - 1; i >= 0; i--) {
        const t = estimateTokens(current[i]);
        if (overlapTokensCount + t > overlapTokens) break;
        overlap.unshift(current[i]);
        overlapTokensCount += t;
      }
      current = overlap;
      currentTokens = overlapTokensCount;
    }

    current.push(para);
    currentTokens += paraTokens;
  }

  if (current.length > 0) {
    chunks.push(current.join("\n\n"));
  }

  return chunks;
}

function sanitizeText(text: string): string {
  return text.replace(/\0/g, "");
}

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on("pdfParser_dataError", (errData: any) =>
      reject(errData?.parserError ?? new Error("PDF parse failed"))
    );
    parser.on("pdfParser_dataReady", (pdfData) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((t) =>
          safeDecode(t.R.map((r) => r.T).join(" "))
        ).join(" ")
      ).join("\n\n");
      resolve(text);
    });
    parser.parseBuffer(buffer);
  });
}

export async function processPdf(documentId: string, pdfUrl: string) {
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    const text = sanitizeText(await extractPdfText(pdfBuffer));
    if (!text || text.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF");
    }

    const chunks = chunkText(text);
    const total = chunks.length;

    const words = text.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(60, Math.round(words / 200) * 60);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "processing",
        chunksTotal: total,
        wordCount: words,
        estimatedReadingTime: readingTime,
      },
    });

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: batch,
      });
      await prisma.documentChunk.createMany({
        data: embeddings.map((e, idx) => ({
          documentId,
          content: batch[idx],
          chunkIndex: i + idx,
          embedding: e,
        })),
      });
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "ready" },
    });
  } catch (err) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "error" },
    });
    throw err;
  }
}
