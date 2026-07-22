import Reveal from "./Reveal";

const steps = [
  {
    number: "01",
    title: "Upload a document",
    description: "Drop a PDF, DOCX, or TXT file. RAGify indexes it instantly — no waiting, no processing bars.",
  },
  {
    number: "02",
    title: "Ask anything",
    description: "Type questions in natural language. Every answer is grounded in your document, not a generic AI guess.",
  },
  {
    number: "03",
    title: "Share the conversation",
    description: "Generate a link. Friends join the chat room and see the same context — ask questions together in real time.",
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
            <Reveal key={step.number} delay={i * 150}>
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl font-extralight text-primary/40">{step.number}</span>
                <div className="mt-4 h-px w-12 bg-primary/30" />
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
