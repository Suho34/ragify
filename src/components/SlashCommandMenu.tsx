"use client";

import { useCallback, useMemo, useState } from "react";
import { useOptionalPromptInputController } from "@/components/ai-elements/prompt-input";

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

export const COMMANDS: SlashCommand[] = [
  {
    id: "summary",
    label: "Summary",
    description: "Concise document summary",
    prompt: "Give me a concise summary of this document.",
  },
  {
    id: "key-findings",
    label: "Key Findings",
    description: "Extract conclusions and key findings",
    prompt: "What are the key findings and conclusions in this document?",
  },
  {
    id: "explain",
    label: "Explain",
    description: "Simplify complex concepts",
    prompt: "Explain the complex concepts in this document in simple terms.",
  },
  {
    id: "action-items",
    label: "Action Items",
    description: "List next steps and recommendations",
    prompt: "What are the action items and next steps from this document?",
  },
  {
    id: "data",
    label: "Data & Metrics",
    description: "Extract statistics and metrics",
    prompt: "Extract all data, statistics, and metrics from this document.",
  },
  {
    id: "tldr",
    label: "TL;DR",
    description: "One-paragraph overview",
    prompt: "Give me a one-paragraph TL;DR of this document.",
  },
  {
    id: "bullets",
    label: "Bullet Points",
    description: "Bullet-point summary",
    prompt: "Summarize this document as bullet points.",
  },
  {
    id: "outline",
    label: "Outline",
    description: "Section-by-section structure",
    prompt: "Give me a section-by-section outline of this document.",
  },
  {
    id: "quotes",
    label: "Key Quotes",
    description: "Find important passages",
    prompt: "What are the most important quotes or passages in this document?",
  },
  {
    id: "pros-cons",
    label: "Pros & Cons",
    description: "Compare approaches",
    prompt: "What are the pros and cons discussed in this document?",
  },
  {
    id: "define",
    label: "Define Terms",
    description: "Define key terminology",
    prompt: "Define the key terms and jargon used in this document.",
  },
  {
    id: "questions",
    label: "Questions",
    description: "Surface unanswered questions",
    prompt: "What questions does this document leave unanswered?",
  },

  {
    id: "recommendations",
    label: "Recommendations",
    description: "Provide actionable advice",
    prompt: "What recommendations or advice can be derived from this document?",
  },

  {
    id: "trends",
    label: "Trends & Insights",
    description: "Identify patterns and trends",
    prompt: "Identify trends, patterns, and insights from this document.",
  },
  {
    id: "risks",
    label: "Risks & Challenges",
    description: "Highlight potential issues",
    prompt: "What are the risks and challenges highlighted in this document?",
  },
  {
    id: "benefits",
    label: "Benefits & Advantages",
    description: "Summarize positive aspects",
    prompt: "Summarize the benefits and advantages discussed in this document.",
  },
  {
    id: "limitations",
    label: "Limitations",
    description: "Identify constraints and limitations",
    prompt:
      "What are the limitations or constraints mentioned in this document?",
  },
  {
    id: "implications",
    label: "Implications",
    description: "Discuss broader implications",
    prompt:
      "Discuss the broader implications of the findings in this document.",
  },
  {
    id: "next-steps",
    label: "Next Steps",
    description: "Outline future actions",
    prompt: "What are the recommended next steps based on this document?",
  },
  {
    id: "compare",
    label: "Compare Docs",
    description: "Contrast all documents",
    prompt:
      "Compare and contrast the key differences between the documents in this room. Highlight conflicting information, different perspectives, and unique insights from each.",
  },
  {
    id: "synthesize",
    label: "Synthesize",
    description: "Combine insights across docs",
    prompt:
      "Synthesize the information from all documents into a single comprehensive overview. Connect related ideas across documents and identify the most important takeaways.",
  },
  {
    id: "common-themes",
    label: "Common Themes",
    description: "Find shared topics across docs",
    prompt:
      "What common themes, topics, or patterns appear consistently across these documents? List the recurring ideas with examples from each document.",
  },
  {
    id: "contradictions",
    label: "Contradictions",
    description: "Find conflicting information",
    prompt:
      "Are there any contradictions, conflicting information, or disagreements between these documents? Point out specific claims or data points that don't align.",
  },
  {
    id: "recommendations-across-docs",
    label: "Recommendations Across Docs",
    description: "Provide actionable advice from all docs",
    prompt:
      "Based on the information in all documents, what are the most important recommendations or actionable advice? Summarize the key takeaways and next steps.",
  },
  {
    id: "summary-across-docs",
    label: "Summary Across Docs",
    description: "Concise overview of all docs",
    prompt:
      "Provide a concise summary of the key points, findings, and conclusions from all documents in this room.",
  },
];

export function useSlashCommand() {
  const [activeIndex, setActiveIndex] = useState(0);
  const controller = useOptionalPromptInputController();

  const inputValue = controller?.textInput.value ?? "";
  const open = inputValue.startsWith("/");
  const filter = open ? inputValue.slice(1) : "";

  const filtered = useMemo(
    () =>
      COMMANDS.filter(
        (c) =>
          c.label.toLowerCase().includes(filter.toLowerCase()) ||
          c.description.toLowerCase().includes(filter.toLowerCase()),
      ),
    [filter],
  );

  const close = useCallback(() => setActiveIndex(0), []);

  const select = useCallback(
    (cmd: SlashCommand) => {
      controller?.textInput.setInput(cmd.prompt);
      setActiveIndex(0);
    },
    [controller],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        select(filtered[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    },
    [open, filtered, activeIndex, select, close],
  );

  const menu = open ? (
    <div className="absolute bottom-full left-0 right-0 mb-2 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
      {filtered.length === 0 ? (
        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
          No commands found
        </div>
      ) : (
        filtered.map((cmd, i) => (
          <button
            key={cmd.id}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
              i === activeIndex
                ? "bg-accent text-accent-foreground"
                : "text-popover-foreground hover:bg-accent"
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              select(cmd);
            }}
            onMouseEnter={() => setActiveIndex(i)}
          >
            <span className="font-medium">{cmd.label}</span>
            <span className="ml-auto text-muted-foreground">
              {cmd.description}
            </span>
          </button>
        ))
      )}
    </div>
  ) : null;

  return { menu, handleKeyDown };
}
