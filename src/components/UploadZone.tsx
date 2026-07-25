"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";

interface UploadZoneProps {
  onUploadComplete?: () => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {uploadError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {uploadError}
        </p>
      )}
      <UploadDropzone
        endpoint="pdfUploader"
        onClientUploadComplete={() => {
          setUploadError(null);
          onUploadComplete?.();
        }}
        onUploadError={(err) => {
          setUploadError(err.message || "Upload failed. Please try again.");
        }}
        appearance={{
          container: {
            border: "1px dashed var(--color-border)",
            borderRadius: "16px",
            background: "var(--color-surface)",
            cursor: "pointer",
          },
          label: {
            color: "var(--color-muted)",
            fontSize: "14px",
          },
          allowedContent: {
            color: "var(--color-muted)",
            fontSize: "12px",
          },
          button: {
            background: "var(--color-primary)",
            color: "black",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "8px",
            padding: "8px 20px",
          },
        }}
        content={{
          label: "Drop your PDF here or click to browse",
          allowedContent: "PDF up to 32MB",
        }}
      />
    </div>
  );
}
