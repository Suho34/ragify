import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAGify — Chat with your docs, together.",
  description:
    "Upload documents, ask questions with RAG-accurate answers, and share chat rooms with friends. No setup, no complexity.",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "RAGify — Chat with your docs, together.",
    description:
      "Upload documents, ask questions with RAG-accurate answers, and share chat rooms with friends.",
    url: "https://ragify.app",
    siteName: "RAGify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAGify — Chat with your docs, together.",
    description:
      "Upload documents, ask questions with RAG-accurate answers, and share chat rooms with friends.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-svh bg-bg font-sans antialiased">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        {children}
      </body>
    </html>
  );
}
