"use client";

import { useRef, useEffect, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: "fade-in-up" | "fade-in";
  delay?: number;
}

export default function Reveal({ children, className = "", variant = "fade-in-up", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) el.style.animationDelay = `${delay}ms`;
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`animate-${variant} ${className}`}>
      {children}
    </div>
  );
}
