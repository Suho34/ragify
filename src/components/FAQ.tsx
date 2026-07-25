"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const faqs = [
  {
    question: "What file types are supported?",
    answer: "PDF, DOCX, TXT, and Markdown files. More formats coming soon.",
  },
  {
    question: "How accurate are the answers?",
    answer: "RAG (Retrieval-Augmented Generation) ensures every answer is grounded in your specific document. The model searches your content first, then answers — so you get facts, not hallucinations.",
  },
  {
    question: "Can I chat with multiple documents at once?",
    answer: "Yes. When creating a chat room, select as many documents as you want. The AI searches across all of them and combines the most relevant chunks into each answer.",
  },
  {
    question: "Can multiple people chat at the same time?",
    answer: "Yes. Share a link to your chat room and anyone with access can join the conversation. Everyone sees the same document context and all messages sync in real time.",
  },
  {
    question: "What can guests do vs signed-in users?",
    answer: "Guests can read and send messages in any room they have a link to. Signed-in users can upload documents, create rooms, rename or delete them, and manage document access.",
  },
  {
    question: "Do I need an account to view a shared chat?",
    answer: "No. People you share a link with can join without signing up. Only document uploaders need an account.",
  },
  {
    question: "What kind of document insights are available?",
    answer: "Click any document to see word count, estimated reading time, file size, chunk processing progress, and a list of all chat rooms using that document — all in a slide-over panel.",
  },
  {
    question: "Is my data used for training?",
    answer: "Never. Your documents are encrypted at rest and in transit. We do not train on your content, and you control document access per chat room.",
  },
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const btnId = `faq-btn-${index}`;
  const panelId = `faq-panel-${index}`;
  return (
    <div className="border-b border-border transition-colors duration-200 hover:bg-surface/50">
      <button
        id={btnId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium text-ink transition-colors hover:text-primary"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        {question}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`h-4 w-4 shrink-0 text-muted transition-all duration-300 ease-out ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
          aria-hidden="true"
        >
          <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h2 className="mb-16 text-center text-3xl font-light tracking-tight sm:text-4xl">
            <span className="font-semibold text-primary">Questions?</span> Answered.
          </h2>
        </Reveal>

        <Reveal variant="fade-in">
          <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                index={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
