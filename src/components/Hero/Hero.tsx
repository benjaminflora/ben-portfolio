"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookletViewer, type BookletViewerHandle } from "@/components/Booklet";
import { FadeInBlock, FadeInText } from "@/components/FadeIn";
import { useLoadInAnimation } from "@/components/FadeIn/FadeInProvider";
import { ArrowDownIcon } from "@/components/icons/ArrowDownIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { scrollToElement } from "@/components/SmoothScroll";
import { COMPANY_HREF } from "@/data/companies";
import styles from "./Hero.module.css";

/* Figma node 290:329 — Hero */

// One flowing block so the browser can balance line lengths at every width.
// Only "autodidact" is interactive — the rest of the line stays plain text.
const HEADING =
  "I’m Ben, a product-oriented designer, entrepreneur, and autodidact shipping to prod.";
const TERM = "autodidact";
const termAt = HEADING.indexOf(TERM);
const HEADING_BEFORE = HEADING.slice(0, termAt).trimEnd();
const HEADING_AFTER = HEADING.slice(termAt + TERM.length).trimStart();
const HEADING_DELAY = 0.05;
const HEADING_STAGGER = 0.025;
const HEADING_BEFORE_COUNT = HEADING_BEFORE.split(" ").length;

const TERM_SYLLABLES = ["au", "to", "di", "dact"] as const;
const TERM_POS = "noun";
const TERM_DEFINITION = "a self-taught person.";

function CompanyLink({ href, children }: { href: string; children: string }) {
  return (
    <a className={styles.companyLink} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function canHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function isHoverPointer(pointerType: string) {
  return pointerType === "mouse" || pointerType === "pen";
}

/** Dictionary entry for the one unusual word in the headline. */
function AutodidactTerm({ delay }: { delay: number }) {
  const shouldAnimate = useLoadInAnimation();
  const entryId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const entryRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const hoveringRef = useRef(false);
  const pinnedRef = useRef(false);
  const pointerFocus = useRef(false);
  const pointerTypeRef = useRef("");
  /** Mouse position while hovering; the card follows it. Null when the card
   * was opened by keyboard or touch, which anchor it under the word. */
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const placeRef = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const requestClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      if (pinnedRef.current || hoveringRef.current) return;
      const button = buttonRef.current;
      const keyboardFocus =
        button !== null && document.activeElement === button && !pointerFocus.current;
      if (keyboardFocus) return;
      setOpen(false);
    }, 120);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target) || entryRef.current?.contains(target)) return;
      pinnedRef.current = false;
      hoveringRef.current = false;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      pinnedRef.current = false;
      hoveringRef.current = false;
      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    const entry = entryRef.current;
    const button = buttonRef.current;
    if (!entry) return;

    if (!open || !button) {
      entry.style.top = "";
      entry.style.left = "";
      delete entry.dataset.placement;
      placeRef.current = null;
      cursorRef.current = null;
      return;
    }

    const place = () => {
      const margin = 12;
      const width = entry.offsetWidth;
      const height = entry.offsetHeight;

      // Pops up above by default; drops below only when the card would run
      // under the fixed nav.
      const topLimit =
        (document.querySelector("header")?.getBoundingClientRect().bottom ?? 0) + margin;

      // Hovering: sit just above-right of the pointer, flipping to the other
      // side near the viewport edges.
      const cursor = cursorRef.current;
      if (cursor) {
        const gap = 16;
        let left = cursor.x + gap;
        if (left + width > window.innerWidth - margin) left = cursor.x - gap - width;
        let top = cursor.y - gap - height;
        if (top < topLimit) top = cursor.y + gap;
        entry.dataset.placement = "cursor";
        entry.style.left = `${Math.round(Math.max(margin, left))}px`;
        entry.style.top = `${Math.round(top)}px`;
        return;
      }

      const rect = button.getBoundingClientRect();
      if (rect.width === 0) return;
      let left = rect.left + rect.width / 2 - width / 2;
      left = Math.min(Math.max(margin, left), window.innerWidth - margin - width);

      let top = rect.top - height;
      let placement = "above";
      if (top < topLimit) {
        top = rect.bottom;
        placement = "below";
      }

      entry.dataset.placement = placement;
      entry.style.left = `${Math.round(left)}px`;
      entry.style.top = `${Math.round(top)}px`;
    };

    place();
    placeRef.current = place;

    const onScroll = () => {
      const rect = button.getBoundingClientRect();
      if (rect.bottom < 48 || rect.top > window.innerHeight) {
        pinnedRef.current = false;
        hoveringRef.current = false;
        setOpen(false);
        return;
      }
      place();
    };

    const observer = new ResizeObserver(place);
    observer.observe(button);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const pending = shouldAnimate === null;

  return (
    <span
      ref={wrapRef}
      className={[styles.termWrap, shouldAnimate ? styles.termWrapAnimate : ""].filter(Boolean).join(" ")}
      style={
        pending
          ? { visibility: "hidden" }
          : shouldAnimate
            ? { animationDelay: `${delay.toFixed(3)}s` }
            : undefined
      }
      onPointerEnter={(event) => {
        if (!isHoverPointer(event.pointerType) || !canHover()) return;
        cancelClose();
        cursorRef.current = { x: event.clientX, y: event.clientY };
        hoveringRef.current = true;
        setOpen(true);
      }}
      onPointerMove={(event) => {
        if (!isHoverPointer(event.pointerType) || !cursorRef.current) return;
        cursorRef.current = { x: event.clientX, y: event.clientY };
        placeRef.current?.();
      }}
      onPointerLeave={(event) => {
        if (!isHoverPointer(event.pointerType)) return;
        hoveringRef.current = false;
        requestClose();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.term}
        aria-expanded={open}
        aria-describedby={entryId}
        aria-hidden={pending ? true : undefined}
        onPointerDown={(event) => {
          pointerTypeRef.current = event.pointerType;
          pointerFocus.current = true;
        }}
        onClick={() => {
          const touch = pointerTypeRef.current === "touch" || !canHover();
          if (!touch) return;
          cursorRef.current = null;
          setOpen((was) => {
            pinnedRef.current = !was;
            return !was;
          });
        }}
        onFocus={(event) => {
          if (pointerFocus.current) return;
          if (!event.currentTarget.matches(":focus-visible")) return;
          cursorRef.current = null;
          setOpen(true);
        }}
        onBlur={() => {
          pointerFocus.current = false;
          if (pinnedRef.current || hoveringRef.current) return;
          setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          pinnedRef.current = false;
          hoveringRef.current = false;
          setOpen(false);
        }}
      >
        {TERM}
        <svg
          className={styles.scribble}
          viewBox="0 0 300 14"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M2 7.4C16 5.6 28 9.2 44 7.2C62 5.1 74 9.4 94 7C114 4.6 128 9.2 150 7.2C170 5.4 186 9.6 208 7C228 4.6 246 9 268 7.4C282 6.2 292 8.4 298 6.8" />
          <path d="M8 10.6C26 8.2 40 5.2 58 8.8C78 12.2 94 5.6 116 9.2C136 12.4 154 5.8 176 9.4C196 12.6 214 6.2 236 9.6C256 12.4 274 7.2 294 9.8" />
        </svg>
      </button>
      {mounted
        ? createPortal(
            <div
              ref={entryRef}
              id={entryId}
              role="tooltip"
              className={open ? styles.entry : styles.entrySr}
              onPointerEnter={(event) => {
                if (!isHoverPointer(event.pointerType)) return;
                cancelClose();
                hoveringRef.current = true;
              }}
              onPointerLeave={(event) => {
                if (!isHoverPointer(event.pointerType)) return;
                hoveringRef.current = false;
                requestClose();
              }}
            >
              <div className={styles.entryCard} key={open ? "open" : "closed"}>
                <p className={styles.headword}>
                  {TERM_SYLLABLES.map((part, index) => (
                    <span key={part}>
                      {index > 0 ? (
                        <span className={styles.syllableDot} aria-hidden="true">
                          ·
                        </span>
                      ) : null}
                      {part}
                    </span>
                  ))}
                </p>
                <p className={styles.pos}>{TERM_POS}</p>
                <p className={styles.definition}>{TERM_DEFINITION}</p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}

export function Hero() {
  const bookletRef = useRef<BookletViewerHandle>(null);
  const [scrolled, setScrolled] = useState(false);

  // The scroll cue bows out once the visitor starts scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.copy} data-hero-copy>
        {/* Load order: heading → subheading → nav → content (book, cards). */}
        <FadeInBlock className={styles.bookletFade} delay="0.75s">
          <BookletViewer ref={bookletRef} />
        </FadeInBlock>
        <FadeInBlock delay="0.8s">
          {/* Says the book is interactive; opens it. */}
          <button
            type="button"
            className={styles.chip}
            onClick={() => bookletRef.current?.open()}
          >
            <span className={styles.chipLabel}>Sketchbook</span>
            <span className={styles.chipAction}>Draw</span>
            <ArrowRightIcon className={styles.chipIcon} />
          </button>
        </FadeInBlock>
        <div className={styles.heading} role="heading" aria-level={1}>
          {[
            <FadeInText
              key="before"
              className={styles.headingRun}
              delay={HEADING_DELAY}
              stagger={HEADING_STAGGER}
            >
              {HEADING_BEFORE}
            </FadeInText>,
            <AutodidactTerm
              key="term"
              delay={HEADING_DELAY + HEADING_BEFORE_COUNT * HEADING_STAGGER}
            />,
            "\u00A0",
            <FadeInText
              key="after"
              className={styles.headingRun}
              delay={HEADING_DELAY + (HEADING_BEFORE_COUNT + 1) * HEADING_STAGGER}
              stagger={HEADING_STAGGER}
            >
              {HEADING_AFTER}
            </FadeInText>,
          ]}
        </div>
        <div className={styles.body}>
          <FadeInBlock delay="0.35s">
            <p className={styles.subtitle}>
              I build delightful experiences for technical problems.
              Currently{" "}
              <strong className={styles.emphasis}>
                shipping to prod @&nbsp;
                <CompanyLink href={COMPANY_HREF.sift}>Sift</CompanyLink>
              </strong>
              , prev. at <CompanyLink href={COMPANY_HREF.july}>July</CompanyLink> and{" "}
              <CompanyLink href={COMPANY_HREF.afterquery}>AfterQuery</CompanyLink>. This
              semester, I’ve been
              researching sub-agent architecture for design-related tasks.
            </p>
          </FadeInBlock>
        </div>
        <FadeInBlock delay="1.1s">
          <button
            type="button"
            className={styles.scrollCue}
            data-hidden={scrolled ? "" : undefined}
            aria-label="Scroll to projects"
            tabIndex={scrolled ? -1 : 0}
            onClick={() => {
              const projects = document.querySelector<HTMLElement>("[data-project-section]");
              if (projects) scrollToElement(projects);
            }}
          >
            <ArrowDownIcon className={styles.scrollCueIcon} />
          </button>
        </FadeInBlock>
      </div>
    </section>
  );
}
