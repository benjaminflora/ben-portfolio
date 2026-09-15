"use client";

import { useLayoutEffect, useRef } from "react";
import FadeIn from "text-fade-in";
import { useLoadInAnimation } from "./FadeInProvider";

interface FadeInTextProps {
  children: string;
  lines?: boolean;
  className?: string;
}

export function FadeInText({
  children,
  lines = false,
  className,
}: FadeInTextProps) {
  const shouldAnimate = useLoadInAnimation();
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const spans = rootRef.current?.querySelectorAll<HTMLElement>(".fade-in span");
    spans?.forEach((span, index) => {
      span.style.setProperty("--delay", `${1 + index * 0.05}s`);
      span.style.animationFillMode = "both";
    });
  }, [shouldAnimate, children, lines]);

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
