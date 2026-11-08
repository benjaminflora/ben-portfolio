"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/atlas";
import styles from "./SectionNav.module.css";

/* Section links as ghost buttons over a liquid highlight: one pill marks the
 * current page, another follows the pointer, and a goo filter (blur + alpha
 * threshold) melts them together when they meet so the fill seems to flow
 * from button to button. */

export interface SectionNavItem {
  key: string;
  label: string;
  current: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

/** Distances from the nav's left and right edges to a button's edges. */
type Edges = { left: number; right: number };

/** Room around the blobs so the blur isn't clipped by the filter region. */
const BLEED = 12;
const LEAD = 0.28;
const TRAIL = 0.55;
const EASE = "cubic-bezier(0.3, 0.9, 0.3, 1)";

function Blob({ edges, visible, ready }: { edges?: Edges; visible: boolean; ready: boolean }) {
  const last = useRef<Edges | undefined>(edges);
  const moving =
    edges && last.current
      ? edges.left > last.current.left
        ? "right"
        : edges.left < last.current.left
          ? "left"
          : null
      : null;

  useEffect(() => {
    if (edges) last.current = edges;
  }, [edges]);

  if (!edges) return null;

  // The leading edge darts ahead and the trailing edge catches up, so the
  // pill stretches as it travels and settles like a drop.
  const leftTime = moving === "left" ? LEAD : TRAIL;
  const rightTime = moving === "left" ? TRAIL : LEAD;

  return (
    <span
      className={styles.blob}
      data-visible={visible ? "" : undefined}
      style={{
        left: edges.left + BLEED,
        right: edges.right + BLEED,
        transition: ready
          ? `left ${leftTime}s ${EASE}, right ${rightTime}s ${EASE}, opacity 0.3s ease, transform 0.3s ${EASE}`
          : "none",
      }}
    />
  );
}

export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [edges, setEdges] = useState<Edges[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const filterId = `goo-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const box = nav.getBoundingClientRect();
    setEdges(
      itemRefs.current.map((el) => {
        const rect = el?.getBoundingClientRect();
        return rect
          ? { left: rect.left - box.left, right: box.right - rect.right }
          : { left: 0, right: 0 };
      }),
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (navRef.current) observer.observe(navRef.current);
    void document.fonts?.ready.then(measure);
    // Start animating only after the first placement, so pills don't slide in.
    const frame = requestAnimationFrame(() => setReady(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [measure, items.length]);

  const current = items.findIndex((item) => item.current);
  // With nothing hovered, the hover pill melts back into the current one.
  const hoverTarget = hover ?? (current >= 0 ? current : null);
  const lastHover = useRef(0);
  if (hoverTarget !== null) lastHover.current = hoverTarget;
  const lastCurrent = useRef(0);
  if (current >= 0) lastCurrent.current = current;

  return (
    <nav
      ref={navRef}
      className={styles.nav}
      aria-label="Sections"
      onMouseLeave={() => setHover(null)}
    >
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
          />
        </filter>
      </svg>
      <span
        className={styles.liquid}
        style={{ filter: `url(#${filterId})` }}
        aria-hidden="true"
      >
        <Blob edges={edges[lastCurrent.current]} visible={current >= 0} ready={ready} />
        <Blob
          edges={edges[lastHover.current]}
          visible={hoverTarget !== null}
          ready={ready}
        />
      </span>
      {items.map((item, index) => (
        <span
          key={item.key}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          className={styles.item}
          onMouseEnter={() => !item.disabled && setHover(index)}
          onFocus={() => setHover(index)}
          onBlur={() => setHover(null)}
        >
          <Button
            variant="ghost"
            className={styles.button}
            disabled={item.disabled}
            aria-current={item.current ? "page" : undefined}
            onClick={item.onSelect}
          >
            {item.label}
          </Button>
        </span>
      ))}
    </nav>
  );
}
