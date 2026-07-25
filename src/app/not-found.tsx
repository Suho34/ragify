import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-light tracking-tight text-ink">404</h1>
      <p className="mt-4 text-muted">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-black transition-all hover:bg-primary-hover"
      >
        Go home
      </Link>
    </div>
  );
}
