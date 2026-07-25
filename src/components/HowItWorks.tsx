import Reveal from "./Reveal";

const steps = [
  {
    title: "Upload a document",
    description: "Drop a PDF, DOCX, or TXT file. RAGify extracts text, chunks it, and embeds it for search — all in seconds.",
  },
  {
    title: "Pick documents to chat with",
    description: "Select one document or combine several into a single chat room. Ask across all of them at once.",
  },
  {
    title: "Invite — no account needed",
    description: "Share the room link. Guests join instantly and can ask questions alongside you. Only you manage documents.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-light tracking-tight sm:text-4xl">
              Three steps, <span className="font-semibold text-primary">zero friction</span>
            </h2>
            <p className="mt-4 text-muted">From document to shared conversation in under a minute.</p>
          </div>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 150}>
              <div className="group flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-muted text-lg font-semibold text-primary transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_0_20px_-4px] group-hover:shadow-primary/30">
                  {i + 1}
                </div>
                <div className="mt-4 h-px w-12 bg-primary/30 transition-all duration-300 group-hover:w-16" />
                <h3 className="mt-6 text-lg font-medium text-ink">{step.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
