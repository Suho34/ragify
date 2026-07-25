import Link from "next/link";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center px-6 pt-24 pb-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Reveal variant="fade-in" delay={100}>
          <span className="inline-block rounded-full border border-primary/30 bg-primary-muted/50 px-4 py-1 text-xs font-medium tracking-wide text-primary">
            RAG-powered document chat
          </span>
        </Reveal>

        <Reveal delay={250}>
          <h1 className="mt-6 max-w-2xl text-balance text-4xl font-extralight leading-[1.05] tracking-tight sm:text-5xl md:text-[clamp(2.5rem,5vw,4.5rem)]">
            Chat with your docs.
            <br />
            <span className="font-semibold text-primary">Together.</span>
          </h1>
        </Reveal>

        <Reveal delay={400}>
          <p className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-muted">
            Upload any document, ask questions with RAG-accurate answers, and share a link so your
            friends can join the conversation. No setup, no complexity.
          </p>
        </Reveal>

        <Reveal delay={550}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-black transition-all duration-200 ease-out hover:bg-primary-hover hover:scale-[1.02]"
            >
              Try it now
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-sm font-medium text-ink transition-all duration-200 ease-out hover:bg-surface"
            >
              See how it works
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
