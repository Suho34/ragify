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
    question: "Can multiple people chat at the same time?",
    answer: "Yes. Share a link to your chat room and anyone with access can join the conversation. Everyone sees the same document context and all messages sync in real time.",
  },
  {
    question: "Is my data used for training?",
    answer: "Never. Your documents are encrypted at rest and in transit. We do not train on your content, and you control document access per chat room.",
  },
  {
    question: "Do I need an account to view a shared chat?",
    answer: "No. People you share a link with can join without signing up. Only document uploaders need an account.",
  },
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium text-ink transition-colors hover:text-primary"
        aria-expanded={isOpen}
      >
        {question}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ease-out ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted">{answer}</p>
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
          <div className="divide-y divide-border rounded-2xl border border-border px-6">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
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
