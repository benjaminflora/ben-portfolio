"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/atlas";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { setSmoothScrollLocked } from "@/components/SmoothScroll";
import { Booklet, prefetchSketches, type BookletHandle } from "./Booklet";
import { notifyBookletClosed, setBookletOpen } from "./bookletState";
import { LINE_SCALE, PEN_BY_ID } from "./pens";
import { loadGuestDrawings } from "./guestState";
import { PenTray } from "./PenTray";
import { SendToBen } from "./SendToBen";
import { redo, undo, updateSketchbook, useSketchbook } from "./sketchbookState";
import { useReaderZoom } from "./useReaderZoom";
import styles from "./BookletViewer.module.css";
import studio from "./Studio.module.css";

/* Hero frame (Figma node 332:1254) that the page "falls into": the frame's
 * clip grows to the viewport while the booklet scales up to reading size. */

export interface BookletViewerHandle {
  open: () => void;
}

interface BookletViewerProps {
  ref?: Ref<BookletViewerHandle>;
  className?: string;
}

/** closed → entering (at frame) → open → leaving (back to frame) → closed */
type Phase = "closed" | "entering" | "open" | "leaving";

type Origin = {
  /** clip-path inset matching the frame. */
  inset: string;
  /** Moves/scales the full-size book onto the inline one. */
  bookTransform: string;
  /** Viewport point the page zooms toward. */
  zoomOrigin: string;
  /** The frame's plate, in overlay coordinates, for the background hand-off. */
  frameBox: {
    left: number;
    top: number;
    width: number;
    height: number;
    radius: string;
  };
};

// Explicit end states so clip-path and transform interpolate.
/** The open reader is a rounded card inset from the edges (tokens
 * --reader-card-inset / --reader-card-radius), so the page shows around it
 * and clicking there closes the book. Same inset() form as the frame clip so
 * the two interpolate. */
function openClip() {
  const root = getComputedStyle(document.documentElement);
  const inset = parseFloat(root.getPropertyValue("--reader-card-inset")) || 0;
  const radius = parseFloat(root.getPropertyValue("--reader-card-radius")) || 0;
  return `inset(${inset}px ${inset}px ${inset}px ${inset}px round ${radius}px)`;
}
const FULL_BOOK = "translate(0px, 0px) scale(1)";

export function BookletViewer({ ref, className }: BookletViewerProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<BookletHandle>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const bookWrapRef = useRef<HTMLDivElement>(null);
  const zoomLayerRef = useRef<HTMLDivElement>(null);
  const { pen, color, size: lineSize } = useSketchbook();
  const { zoomed, reset: resetZoom } = useReaderZoom(
    bookWrapRef,
    zoomLayerRef,
    {
      penInHand: pen !== null,
      enabled: phase === "open",
    },
  );

  const measure = useCallback((): Origin | null => {
    const frame = frameRef.current;
    if (!frame) return null;
    // The page behind zooms toward the frame's centre while the reader is
    // open, so the centre never moves; take the size from layout (unaffected
    // by the zoom) to aim at where the frame sits once the page settles.
    const zoomed = frame.getBoundingClientRect();
    const cx = zoomed.left + zoomed.width / 2;
    const cy = zoomed.top + zoomed.height / 2;
    const fw = frame.offsetWidth;
    const fh = frame.offsetHeight;
    const rect = {
      left: cx - fw / 2,
      right: cx + fw / 2,
      top: cy - fh / 2,
      bottom: cy + fh / 2,
      width: fw,
      height: fh,
    };
    // The overlay sits below the nav, so measure against its own box.
    const box = overlayRef.current?.getBoundingClientRect() ?? {
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const inlineBook = frame.querySelector<HTMLElement>("[data-booklet-book]");
    const readerBook = overlayRef.current?.querySelector<HTMLElement>(
      "[data-booklet-book]",
    );
    const scale =
      inlineBook && readerBook && readerBook.offsetWidth
        ? inlineBook.offsetWidth / readerBook.offsetWidth
        : 0.4;
    // The book sits above centre (room for the pens), so aim from its own
    // centre rather than the overlay's.
    const wrap = readerBook?.closest<HTMLElement>(`.${styles.bookWrap}`);
    const lift = wrap
      ? parseFloat(getComputedStyle(wrap).paddingBottom) || 0
      : 0;
    const dx = rect.left + rect.width / 2 - (box.left + box.width / 2);
    const dy = rect.top + rect.height / 2 - (box.top + (box.height - lift) / 2);
    const radius = getComputedStyle(frame).borderRadius;
    // transform-origin is resolved against the zoomed page's own box (which
    // starts below the nav and moves with scroll), not the viewport. Measured
    // while the page is unzoomed; close() keeps the opening value.
    const page = frame.closest<HTMLElement>("[data-booklet-zoom-root]");
    const pageBox = page?.getBoundingClientRect() ?? { left: 0, top: 0 };

    return {
      inset: `inset(${rect.top - box.top}px ${box.right - rect.right}px ${box.bottom - rect.bottom}px ${rect.left - box.left}px round ${radius})`,
      bookTransform: `translate(${dx}px, ${dy}px) scale(${scale})`,
      zoomOrigin: `${cx - pageBox.left}px ${cy - pageBox.top}px`,
      frameBox: {
        left: rect.left - box.left,
        top: rect.top - box.top,
        width: rect.width,
        height: rect.height,
        radius,
      },
    };
  }, []);

  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    if (phase !== "closed") return;
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setSmoothScrollLocked(true);
    prefetchSketches();
    loadGuestDrawings();
    setPhase("entering");
  }, [phase]);

  const close = useCallback(() => {
    if (phase !== "open") return;
    readerRef.current?.reset();
    resetZoom();
    // The page is still zoomed here, so its box can't give the origin again;
    // keep the one it zoomed about, or the pivot jumps as it zooms back out.
    const next = measure();
    setOrigin((prev) =>
      next && prev ? { ...next, zoomOrigin: prev.zoomOrigin } : next,
    );
    setPhase("leaving");
  }, [phase, measure, resetZoom]);

  useImperativeHandle(ref, () => ({ open }), [open]);

  // Let the nav show "sketchbook" and close the reader from its breadcrumb.
  useEffect(() => {
    setBookletOpen(phase === "entering" || phase === "open", close);
  }, [phase, close]);

  // Leaving home with the reader up (e.g. a nav jump to another page): drop
  // the scroll lock and page zoom at once, with no zoom-out on the next page.
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  useEffect(
    () => () => {
      setBookletOpen(false, null);
      if (phaseRef.current === "closed") return;
      const root = document.documentElement;
      root.style.setProperty("--booklet-fall-duration", "0s");
      root.removeAttribute("data-booklet-zoom");
      setSmoothScrollLocked(false);
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          root.style.removeProperty("--booklet-fall-duration"),
        ),
      );
    },
    [],
  );

  // Overlay is mounted at the frame; measure it, then release to full screen.
  useLayoutEffect(() => {
    if (phase !== "entering") return;
    setOrigin(measure());
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setPhase("open"));
    });
    return () => cancelAnimationFrame(raf);
  }, [phase, measure]);

  // Zoom the page behind toward the frame while falling in.
  useEffect(() => {
    const root = document.documentElement;
    if (origin)
      root.style.setProperty("--booklet-zoom-origin", origin.zoomOrigin);
    if (phase === "open") root.setAttribute("data-booklet-zoom", "");
    else root.removeAttribute("data-booklet-zoom");
  }, [phase, origin]);

  useEffect(() => {
    if (phase !== "open") return;
    overlayRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && (key === "z" || key === "y")) {
        event.preventDefault();
        if (key === "y" || event.shiftKey) redo();
        else undo();
        return;
      }
      if (event.key === "Escape") {
        // Put the pen down before leaving the book.
        if (pen) updateSketchbook({ pen: null });
        else close();
      }
      if (event.defaultPrevented) return;
      if (event.key === "ArrowRight") readerRef.current?.next();
      if (event.key === "ArrowLeft") readerRef.current?.prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, close, pen]);

  // A dot the size of the nib follows the pointer over drawable pages.
  const moveNib = (event: PointerEvent<HTMLDivElement>) => {
    const el = cursorRef.current;
    if (!el || !pen || event.pointerType === "touch") return;
    const surface = (event.target as Element).closest("[data-draw-surface]");
    el.toggleAttribute("data-visible", surface !== null);
    if (!surface) return;
    const size = Math.max(
      3,
      surface.getBoundingClientRect().width * PEN_BY_ID[pen].width * LINE_SCALE[lineSize],
    );
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.transform = `translate(${event.clientX - size / 2}px, ${event.clientY - size / 2}px)`;
  };

  const returnFocus = useRef(false);

  const finishLeaving = useCallback(() => {
    returnFocus.current = true;
    setPhase("closed");
    setOrigin(null);
    setSmoothScrollLocked(false);
    notifyBookletClosed();
  }, []);

  // The frame is hidden until this render commits, so focus it afterwards.
  useEffect(() => {
    if (phase === "closed" && returnFocus.current) {
      returnFocus.current = false;
      const target = opener.current?.isConnected
        ? opener.current
        : frameRef.current;
      target?.focus({ preventScroll: true });
    }
  }, [phase]);

  // Fallback in case transitionend never fires (e.g. an unchanged clip).
  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = window.setTimeout(finishLeaving, 1500);
    return () => window.clearTimeout(timer);
  }, [phase, finishLeaving]);

  const onTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (
      phase === "leaving" &&
      event.target === overlayRef.current &&
      event.propertyName === "clip-path"
    ) {
      finishLeaving();
    }
  };

  const atFrame = phase === "entering" || phase === "leaving";
  const mounted = phase !== "closed";

  return (
    <>
      <div
        ref={frameRef}
        className={[styles.frame, className].filter(Boolean).join(" ")}
        data-hidden={mounted ? "" : undefined}
        role="button"
        tabIndex={0}
        aria-label="Open sketchbook"
        aria-haspopup="dialog"
        // Someone's about to open it: fetch the drawings and guest pages now.
        onPointerEnter={() => {
          prefetchSketches();
          loadGuestDrawings();
        }}
        onFocus={() => {
          prefetchSketches();
          loadGuestDrawings();
        }}
        onTouchStart={() => {
          prefetchSketches();
          loadGuestDrawings();
        }}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
      >
        <Booklet interactive={false} paused={mounted} />
      </div>

      {mounted
        ? createPortal(
            <>
              {/* Dimmed page around the card; clicking it closes the book. */}
              <div
                className={styles.backdrop}
                data-phase={phase}
                aria-hidden="true"
                onClick={close}
              />
              <div
                ref={overlayRef}
                className={styles.overlay}
                data-phase={phase}
                role="dialog"
                aria-modal="true"
                aria-label="Sketchbook"
                tabIndex={-1}
                style={{
                  clipPath: atFrame && origin ? origin.inset : openClip(),
                }}
                onTransitionEnd={onTransitionEnd}
                onPointerMove={pen ? moveNib : undefined}
                onPointerLeave={() =>
                  cursorRef.current?.removeAttribute("data-visible")
                }
              >
                {/* The hero frame's own plate, fading in as the reader shrinks
                    back onto it (and out as it opens), so the backgrounds meet. */}
                {origin ? (
                  <div
                    className={styles.frameGhost}
                    aria-hidden="true"
                    style={{
                      left: origin.frameBox.left,
                      top: origin.frameBox.top,
                      width: origin.frameBox.width,
                      height: origin.frameBox.height,
                      borderRadius: origin.frameBox.radius,
                      opacity: atFrame ? 1 : 0,
                    }}
                  />
                ) : null}
                <div
                  ref={bookWrapRef}
                  className={styles.bookWrap}
                  style={{
                    transform:
                      atFrame && origin ? origin.bookTransform : FULL_BOOK,
                  }}
                >
                  {/* Pinch-zoom layer (see useReaderZoom). */}
                  <div ref={zoomLayerRef} className={styles.zoomLayer}>
                    <Booklet
                      ref={readerRef}
                      size="reader"
                      pen={pen}
                      paused={phase === "leaving"}
                    />
                  </div>
                </div>
                <div className={styles.chrome}>
                <div className={styles.back}>
                  <Button variant="secondary" iconOnly aria-label="Close sketchbook" onClick={close}>
                    <CloseIcon />
                  </Button>
                </div>
                  <div className={styles.topRight}>
                    {zoomed ? (
                      <button
                        type="button"
                        className={styles.zoomReset}
                        onClick={resetZoom}
                      >
                        Reset zoom
                      </button>
                    ) : null}
                    <SendToBen />
                  </div>
                  <PenTray onPick={() => readerRef.current?.showDrawable()} />
                </div>
                {pen ? (
                  <div
                    ref={cursorRef}
                    className={studio.nibDot}
                    data-eraser={pen === "eraser" ? "" : undefined}
                    style={{ background: pen !== "eraser" && color ? color : PEN_BY_ID[pen].ink }}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
