"use client";

import { useEffect, useRef } from "react";
import FadeIn from "text-fade-in";
import { useLoadInAnimation } from "./FadeInProvider";

interface FadeInTextProps {
  children: string;
  lines?: boolean;
  /** Seconds before the first word appears. */
  delay?: number;
  /** Seconds between successive words/lines. */
  stagger?: number;
  className?: string;
}

export function FadeInText({
  children,
  lines = false,
  delay = 0.1,
  stagger = 0.03,
  className,
}: FadeInTextProps) {
  const shouldAnimate = useLoadInAnimation();
  const rootRef = useRef<HTMLDivElement>(null);

  // text-fade-in's own effect rewrites --delay on every word on the page to a
  // hard-coded 1s + 0.05s stagger, so set animation-delay itself, which takes
  // precedence over the library's var(--delay) whichever effect runs last.
  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const spans = rootRef.current?.querySelectorAll<HTMLElement>(".fade-in span");
    spans?.forEach((span, index) => {
      span.style.animationDelay = `${delay + index * stagger}s`;
      span.style.animationFillMode = "both";
    });
  }, [shouldAnimate, children, lines, delay, stagger]);

  if (shouldAnimate === false) {
    return <div className={className}>{children}</div>;
  }

  if (!shouldAnimate) {
    return (
      <div className={className} style={{ visibility: "hidden" }} aria-hidden>
        {children}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={className}>
      <FadeIn lines={lines}>{children}</FadeIn>
    </div>
  );
}
