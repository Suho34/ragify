"use client";

import { useEffect, useState, useCallback } from "react";

interface TourStep {
  target: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const STEPS: TourStep[] = [
  {
    target: '[data-tour="welcome"]',
    title: "Welcome to RAGify",
    description: "Let's quickly walk through what you can do here. You can skip this tour anytime.",
    placement: "bottom",
  },
  {
    target: '[data-tour="upload-btn"]',
    title: "Upload Documents",
    description: "Click here to upload PDF, DOCX, or TXT files. They're processed automatically and ready to chat within seconds.",
    placement: "bottom",
  },
  {
    target: '[data-tour="new-chat-btn"]',
    title: "Multi-Document Chat",
    description: "Create a chat room with one or more documents. Select multiple docs to ask questions across all of them at once.",
    placement: "bottom",
  },
  {
    target: '[data-tour="doc-list"]',
    title: "Your Documents",
    description: "All your uploaded files appear here. Each row shows the document name, upload date, and processing status.",
    placement: "top",
  },
  {
    target: '[data-tour="doc-row"]',
    title: "Document Actions",
    description: "Click any document to see insights — word count, reading time, and more. Use the Chat button to start a conversation.",
    placement: "left",
  },
  {
    target: '[data-tour="nav-links"]',
    title: "Navigation",
    description: "Switch between your Documents and Chats from here. Your profile menu is on the right.",
    placement: "bottom",
  },
];

const STORAGE_KEY = "ragify-tour-seen";

export default function Tour() {
  const [step, setStep] = useState(-1);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [tooltipAlign, setTooltipAlign] = useState<"start" | "center" | "end">("center");

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setStep(0), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const updatePositions = useCallback(() => {
    if (step < 0 || step >= STEPS.length) return;
    const el = document.querySelector(STEPS[step].target) as HTMLElement | null;
    if (!el) {
      setPosition({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }
    const rect = el.getBoundingClientRect();
    setPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });

    const placement = STEPS[step].placement ?? "bottom";
    const gap = 12;
    const cardWidth = 320;

    let tTop = 0, tLeft = 0, align: "start" | "center" | "end" = "center";

    if (placement === "bottom") {
      tTop = rect.bottom + gap;
      tLeft = rect.left + rect.width / 2 - cardWidth / 2;
      align = "center";
    } else if (placement === "top") {
      tTop = rect.top - gap;
      tLeft = rect.left + rect.width / 2 - cardWidth / 2;
      align = "center";
    } else if (placement === "left") {
      tTop = rect.top + rect.height / 2;
      tLeft = rect.left - gap - cardWidth;
      align = "end";
    } else if (placement === "right") {
      tTop = rect.top + rect.height / 2;
      tLeft = rect.right + gap;
      align = "start";
    }

    tTop = Math.max(16, Math.min(tTop, window.innerHeight - 200));
    tLeft = Math.max(16, Math.min(tLeft, window.innerWidth - cardWidth - 16));
    setTooltipPos({ top: tTop, left: tLeft });
    setTooltipAlign(align);
  }, [step]);

  useEffect(() => {
    updatePositions();
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions);
    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions);
    };
  }, [updatePositions]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setStep(-1); localStorage.setItem(STORAGE_KEY, "1"); }
    };
    if (step >= 0) {
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [step]);

  if (step < 0 || step >= STEPS.length) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) {
      setStep(-1);
      localStorage.setItem(STORAGE_KEY, "1");
    } else {
      setStep((s) => s + 1);
    }
  };

  const skip = () => {
    setStep(-1);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  return (
    <>
      <div className="fixed inset-0 z-[999]" onClick={next} />
      <div
        className="fixed z-[1000] rounded-xl border-2 border-primary/40"
        style={{
          top: position.top - 4,
          left: position.left - 4,
          width: position.width + 8,
          height: position.height + 8,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
        }}
      />
      <div
        className="fixed z-[1001] w-80 rounded-xl border border-border bg-surface p-5 shadow-2xl"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <p className="text-[10px] font-medium text-muted uppercase tracking-wider">
          {step + 1} of {STEPS.length}
        </p>
        <h3 className="mt-1 text-sm font-medium text-ink">{current.title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">{current.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-5 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={skip}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-ink"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-black transition-all hover:bg-primary-hover"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
