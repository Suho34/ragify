import Reveal from "./Reveal";

const features = [
  {
    title: "Upload & Analyze",
    description: "Drop any document — PDF, DOCX, TXT — and instantly start asking questions. RAG extracts the answers from your content, not from thin air.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-primary" aria-hidden="true">
        <path d="M12 16v-4m0 0V8m0 4H8m4 0h4" strokeLinecap="round" />
        <path d="M4 6.5V4a2 2 0 012-2h8.5L20 7.5V20a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
      </svg>
    ),
  },
  {
    title: "Cross-Document Chat",
    description: "Select multiple documents and ask across all of them at once. RAG searches every linked doc so you get answers from your entire knowledge base.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-primary" aria-hidden="true">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Document Insights",
    description: "Click any document to see word count, reading time, file size, and processing status — all at a glance. A quick stats panel without leaving the dashboard.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-primary" aria-hidden="true">
        <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Chat with RAG Accuracy",
    description: "Get precise answers grounded in your documents. No generic AI guesses — every response is sourced from what you uploaded.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-primary" aria-hidden="true">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Guest Access",
    description: "Share a room link and anyone can join without signing up. Guests can read and send messages — only document owners manage uploads and settings.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-primary" aria-hidden="true">
        <path d="M18 18.72a9.094 9.094 0 003.741-.479L23 19.5l-.636-2.023A9.091 9.091 0 0021 13.636M15 5.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM4.5 13.636a9.094 9.094 0 003.741.479M7.5 14.5a4.5 4.5 0 10-9 0 4.5 4.5 0 009 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Privacy First",
    description: "Your documents stay yours. Encrypted storage, no training on your data, and you control who gets access to each chat room.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-primary" aria-hidden="true">
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-light tracking-tight sm:text-4xl">
              Everything you need to
              <span className="font-semibold text-primary"> talk to your documents</span>
            </h2>
            <p className="mt-4 text-muted">No AI fatigue. Just a natural conversation with your content.</p>
          </div>
        </Reveal>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={100 + i * 80}>
              <div className="group flex flex-col gap-4 bg-surface p-8 h-full transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted/50 transition-colors duration-300 group-hover:bg-primary-muted">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-medium text-ink">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
