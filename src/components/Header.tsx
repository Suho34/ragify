"use client";

import { useState, useEffect } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out ${
        scrolled ? "bg-bg/80 backdrop-blur-md shadow-[0_1px_0_var(--color-border)]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="text-lg font-semibold tracking-tight text-ink">
          RAGify
        </a>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:text-ink sm:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            ) : (
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <div className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors duration-200 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/login"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-black transition-all duration-200 ease-out hover:bg-primary-hover hover:scale-[1.02]"
          >
            Try it now
          </a>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-bg px-6 pb-6 pt-4 sm:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-black"
            >
              Try it now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
