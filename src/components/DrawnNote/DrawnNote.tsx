"use client";

import { useEffect, useRef } from "react";
import styles from "./DrawnNote.module.css";

/* Hand-drawn notes from the Atlas file (e.g. node 406:456, "it all starts
 * here.."), written onto the page stroke by stroke like handwriting.
 *
 * The SVG is loaded as-is from /public and placed inline so each stroke can be
 * animated: every path is dashed to its own length, then the dash is drawn
 * back in document order (the order the strokes were drawn in Figma). */

interface DrawnNoteProps {
  /** Path under /public to an all-stroke SVG. */
  src: string;
  /** Seconds to wait after the note scrolls into view. */
  delay?: number;
  /** Pen speed in px of stroke per second. */
  speed?: number;
  className?: string;
}

/** Pause between lifting the pen and starting the next stroke. */
const PEN_LIFT_MS = 45;

export function DrawnNote({ src, delay = 0, speed = 620, className }: DrawnNoteProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    const animations: Animation[] = [];

    fetch(src)
      .then((response) => response.text())
      .then((markup) => {
        if (cancelled) return;
        // Our own static asset, not user content.
        root.innerHTML = markup;
        const paths = [...root.querySelectorAll<SVGPathElement>("path")];
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce || paths.length === 0) {
          root.dataset.ready = "";
          return;
        }

        // Hide every stroke behind its own dash before the first paint.
        const lengths = paths.map((path) => {
          const length = path.getTotalLength();
          path.style.strokeDasharray = `${length} ${length}`;
          path.style.strokeDashoffset = `${length}`;
          return length;
        });
        root.dataset.ready = "";

        const write = () => {
          let at = delay * 1000;
          paths.forEach((path, index) => {
            const length = lengths[index];
            // Dots and ticks still take a beat; long strokes keep the pace.
            const duration = Math.max(90, (length / speed) * 1000);
            animations.push(
              path.animate(
                [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
                { duration, delay: at, easing: "cubic-bezier(0.45, 0, 0.3, 1)", fill: "forwards" },
              ),
            );
            at += duration + PEN_LIFT_MS;
          });
        };

        observer = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            observer?.disconnect();
            write();
          },
          { threshold: 0.4 },
        );
        observer.observe(root);
      })
      .catch(() => {
        // Decorative: if it can't load, the page reads fine without it.
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [src, delay, speed]);

  return (
    <div
      ref={rootRef}
      className={[styles.note, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
