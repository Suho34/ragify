import Link from "next/link";
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-ink"
        >
          RAGify
        </Link>
        <p className="text-xs text-muted">
          &copy; {year} RAGify. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
