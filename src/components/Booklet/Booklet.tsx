"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import { sketches, type Sketch } from "@/data/sketches";
import { groupPages, type GuestDrawing, type GuestPage as GuestPageData } from "@/lib/guestbook";
import { GuestReplay } from "./GuestReplay";
import { useGuestDrawings } from "./guestState";
import { LINE_SCALE, PEN_BY_ID, type PenId } from "./pens";
import { paintSegment } from "./paint";
import { isGestureActive, onGestureStart } from "./gestureState";
import {
  addStroke,
  discardStroke,
  guestPageId,
  strokes,
  turnEngine,
  useSketchbook,
  type Stroke,
} from "./sketchbookState";
import styles from "./Booklet.module.css";

/* Figma node 332:1254 — "Frosted glass magazine", built as a 3D page-turn booklet.
 * Structure: solid cover → drawing pages → solid back.
 * Turned pages lie flat to the left, so an open book reads as a centred spread. */

let sketchesPrefetched = false;

/** Starts downloading Ben's drawings (large traced SVGs) ahead of the reader
 * opening, e.g. when someone hovers or touches the sketchbook. */
export function prefetchSketches() {
  if (sketchesPrefetched || typeof window === "undefined") return;
  sketchesPrefetched = true;
  for (const sketch of sketches) {
    const img = new Image();
    img.decoding = "async";
    img.src = sketch.src;
  }
}

export interface BookletHandle {
  next: () => void;
  prev: () => void;
  /** Turns back to the closed cover. */
  reset: () => void;
  /** Opens a closed book to the nearest spread so there's a page to draw
   * on; an open book stays on its spread (so people can draw on any page,
   * including other visitors'). */
  showDrawable: () => void;
}

interface BookletProps {
  ref?: Ref<BookletHandle>;
  /** `inline` sits in the hero frame; `reader` fills the full-screen viewer. */
  size?: "inline" | "reader";
  /** When false the booklet is a static preview: no swiping or keyboard. */
  interactive?: boolean;
  /** Holds the idle drift (e.g. while covered by the reader). */
  paused?: boolean;
  /** Pen in hand: page presses draw instead of turning. */
  pen?: PenId | null;
  /** Renders what's on the inside pages (drawings, guest replays). The
   * reader holds this off while it opens, so decoding the large drawings
   * doesn't stall the opening animation. */
  showPages?: boolean;
  className?: string;
}

type Face = {
  key: string;
  node: ReactNode;
  className: string;
  drawable?: boolean;
  /** An empty page (no drawing printed on it). */
  blank?: boolean;
};

const DRAG_THRESHOLD = 6;
const FLICK_VELOCITY = 0.4; // px per ms
const COMMIT_PROGRESS = 0.35;
/** Pointer-follow tilt easing per frame. */
const TILT_EASE = 0.08;

/** Pen in hand for the reader's pages; undefined in the static preview. */
const DrawingContext = createContext<PenId | null | undefined>(undefined);

function DrawSurface({ pageId }: { pageId: string }) {
  const pen = useContext(DrawingContext);
  const { revision, color, size } = useSketchbook();
  /** Chosen line weight (not `scale` below, the page's pixel width). */
  const lineScale = LINE_SCALE[size];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Strokes in progress, one per finger/pen.
  const active = useRef(new Map<number, { stroke: Stroke; x: number; y: number; t: number }>());

  // A pinch or pan began: its fingers were never meant as strokes.
  useEffect(
    () =>
      onGestureStart(() => {
        for (const a of active.current.values()) discardStroke(pageId, a.stroke);
        active.current.clear();
      }),
    [pageId],
  );

  const context = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return null;
    const dpr = canvas.width / Math.max(1, canvas.offsetWidth);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return { ctx, size: canvas.offsetWidth };
  }, []);

  // Size to the page (layout box, unaffected by the 3D tilt) and repaint.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(canvas.offsetWidth * dpr);
      canvas.height = Math.round(canvas.offsetHeight * dpr);
      const c = context();
      if (!c) return;
      for (const stroke of strokes.get(pageId) ?? []) {
        const count = stroke.points.length / 3;
        for (let i = count === 1 ? 0 : 1; i < count; i++) paintSegment(c.ctx, stroke, i, c.size);
      }
    };
    // Repaints on resize, and on undo/redo via `revision`.
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [pageId, context, revision]);

  const locate = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    // Both axes over the width, so strokes keep their shape at any size.
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.width,
      scale: rect.width,
    };
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!pen || e.button !== 0 || isGestureActive()) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = locate(e);
    const base = PEN_BY_ID[pen].width * lineScale;
    const w = e.pointerType === "pen" && e.pressure > 0 ? base * (0.5 + e.pressure) : base;
    const stroke: Stroke = {
      pen,
      points: [x, y, w],
      t: [e.timeStamp],
      ...(color && pen !== "eraser" ? { color } : {}),
    };
    addStroke(pageId, stroke);
    active.current.set(e.pointerId, { stroke, x, y, t: e.timeStamp });
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const a = active.current.get(e.pointerId);
    if (!a) return;
    // Released outside the window (no pointerup reaches us): end the stroke
    // rather than carrying on when the pointer comes back.
    if (e.pointerType === "mouse" && e.buttons === 0) {
      finish(e.pointerId);
      return;
    }
    // Let the move bubble so the reader's nib dot keeps following mid-stroke.
    const c = context();
    if (!c) return;
    const pen = PEN_BY_ID[a.stroke.pen];
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const { x, y, scale } = locate(ev);
      const dist = Math.hypot(x - a.x, y - a.y) * scale;
      if (dist < 0.75) continue;
      const speed = dist / Math.max(1, ev.timeStamp - a.t);
      const pts = a.stroke.points;
      const prev = pts[pts.length - 1];
      const nib = pen.width * lineScale;
      let w = nib;
      if (ev.pointerType === "pen" && ev.pressure > 0) {
        w = nib * (0.5 + ev.pressure);
      } else if (pen.kind === "ink") {
        // The delta nib lays down more ink on slow strokes.
        const target = nib * Math.min(1.35, Math.max(0.55, 1.35 - speed * 0.35));
        w = prev + (target - prev) * 0.35;
      }
      pts.push(x, y, w);
      a.stroke.t.push(ev.timeStamp);
      paintSegment(c.ctx, a.stroke, pts.length / 3 - 1, c.size);
      a.x = x;
      a.y = y;
      a.t = ev.timeStamp;
    }
  };

  const finish = (pointerId: number) => {
    const a = active.current.get(pointerId);
    if (!a) return;
    active.current.delete(pointerId);
    if (a.stroke.points.length === 3) {
      const c = context();
      if (c) paintSegment(c.ctx, a.stroke, 0, c.size);
    }
    if (a.stroke.pen === "kurutoga") turnEngine();
  };

  const onPointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!active.current.has(e.pointerId)) return;
    e.stopPropagation();
    finish(e.pointerId);
  };

  return (
    <canvas
      ref={canvasRef}
      className={styles.drawSurface}
      data-draw-surface={pen ? "" : undefined}
      style={{ touchAction: pen ? "none" : undefined }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={(e) => finish(e.pointerId)}
    />
  );
}

function SketchPage({ sketch, pageId }: { sketch?: Sketch; pageId: string }) {
  const pen = useContext(DrawingContext);
  const shown = useContext(PagesShownContext);
  return (
    <>
      <div className={styles.content}>
        {/* Only the open reader shows the drawings (the hero book is
            closed), so the large traced SVGs don't load with the page. */}
        {sketch && pen !== undefined && shown ? (
          <img
            className={styles.sketch}
            src={sketch.src}
            alt={sketch.alt}
            loading="lazy"
            draggable={false}
          />
        ) : null}
      </div>
      {pen !== undefined ? <DrawSurface pageId={pageId} /> : null}
    </>
  );
}

type Page = { kind: "sketch"; sketch: Sketch } | { kind: "guest"; page: GuestPageData };

function buildFaces(items: Sketch[], guests: GuestDrawing[]): Face[] {
  // Ben's drawings, then the guest pages (anyone can add to those), then one
  // fresh blank page for someone who wants a page of their own (as are the
  // inside covers). An odd count is padded with a blank so every sheet has two
  // sides; blank pages each need their own id so drawings stay put.
  const guestPages = groupPages(guests);
  const pages: (Page | undefined)[] = [
    ...items.map((sketch) => ({ kind: "sketch" as const, sketch })),
    ...guestPages.map((page) => ({ kind: "guest" as const, page })),
    ...(guestPages.length ? [undefined] : []),
  ];
  if (pages.length % 2 === 1) pages.push(undefined);
  let blank = 0;

  return [
    { key: "cover", className: `${styles.solid} ${styles.cover}`, node: null },
    {
      key: "cover-inside",
      className: `${styles.solid} ${styles.insideCover} ${styles.stackLeft}`,
      drawable: true,
      blank: true,
      node: <SketchPage pageId="cover-inside" />,
    },
    ...pages.map((page): Face => {
      if (page?.kind === "guest") {
        const key = guestPageId(page.page.id);
        return {
          key,
          className: styles.page,
          drawable: true,
          node: <GuestPage faceKey={key} page={page.page} />,
        };
      }
      const sketch = page?.sketch;
      const id = sketch ? sketch.id : `blank-${++blank}`;
      return {
        key: id,
        className: styles.page,
        drawable: true,
        blank: !sketch,
        node: <SketchPage sketch={sketch} pageId={id} />,
      };
    }),
    {
      key: "back-inside",
      className: `${styles.solid} ${styles.insideCover} ${styles.stackRight}`,
      drawable: true,
      blank: true,
      node: <SketchPage pageId="back-inside" />,
    },
    {
      key: "back",
      className: `${styles.solid} ${styles.back}`,
      node: <span className={styles.backMark}>benjaminflora.com</span>,
    },
  ];
}

function buildBook(guests: GuestDrawing[]) {
  const faces = buildFaces(sketches, guests);
  const leaves = Array.from({ length: faces.length / 2 }, (_, i) => ({
    front: faces[i * 2],
    back: faces[i * 2 + 1],
  }));
  const leafCount = leaves.length;
  return { faces, leaves, leafCount };
}

/** Whether inside-page content is rendered yet (see `showPages`). */
const PagesShownContext = createContext(true);

/** Guest pages visible on the open spread, while the reader is up. */
const VisibleFacesContext = createContext<ReadonlySet<string>>(new Set());

/** A guest page: replays everyone's drawings on it (each with their name
 * cursor) each time it comes into view in the reader, and can be drawn on to
 * add to it. */
function GuestPage({ faceKey, page }: { faceKey: string; page: GuestPageData }) {
  const pen = useContext(DrawingContext);
  const shown = useContext(PagesShownContext);
  const visible = useContext(VisibleFacesContext).has(faceKey);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!visible) {
      setPlaying(false);
      return;
    }
    // Let the page finish turning before the pen starts.
    const timer = window.setTimeout(() => setPlaying(true), 450);
    return () => window.clearTimeout(timer);
  }, [visible]);
  // The closed hero book never shows inside pages, and the reader holds them
  // back while it opens: paint nothing until then.
  if (pen === undefined || !shown) return null;
  return (
    <>
      <GuestReplay layers={page.layers} playing={playing} />
      <DrawSurface pageId={faceKey} />
    </>
  );
}

type Drag = { leaf: number; progress: number };

export function Booklet({
  ref,
  size = "inline",
  interactive = true,
  paused = false,
  pen,
  showPages = true,
  className,
}: BookletProps) {
  const guests = useGuestDrawings();
  const { faces, leaves, leafCount } = useMemo(
    () => buildBook(guests),
    [guests],
  );
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [offscreen, setOffscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{
    id: number;
    x: number;
    t: number;
    moved: boolean;
    leaf: number | null;
    forward: boolean;
  } | null>(null);

  // Leaves still swinging after a turn or release, each with a timer for when
  // it lands. A moving leaf counts toward neither page stack.
  const moving = useRef(new Map<number, number>());
  const [, refresh] = useReducer((n: number) => n + 1, 0);

  const markMoving = useCallback((from: number, to: number) => {
    const stage = stageRef.current;
    const turn = stage
      ? parseFloat(getComputedStyle(stage).getPropertyValue("--booklet-turn-duration")) * 1000
      : NaN;
    const ms = Number.isFinite(turn) ? turn : 700;
    for (let i = Math.min(from, to); i < Math.max(from, to); i++) {
      window.clearTimeout(moving.current.get(i));
      moving.current.set(
        i,
        window.setTimeout(() => {
          moving.current.delete(i);
          refresh();
        }, ms),
      );
    }
  }, []);

  useEffect(() => {
    const timers = moving.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const turnTo = useCallback(
    (next: number) => {
      const target = Math.min(leafCount, Math.max(0, next));
      markMoving(currentRef.current, target);
      currentRef.current = target;
      setCurrent(target);
    },
    [markMoving, leafCount],
  );

  const go = useCallback((delta: number) => turnTo(currentRef.current + delta), [turnTo]);

  useImperativeHandle(
    ref,
    () => ({
      next: () => go(1),
      prev: () => go(-1),
      reset: () => turnTo(0),
      showDrawable: () => {
        const at = currentRef.current;
        if (at === 0) turnTo(1);
        else if (at === leafCount) turnTo(leafCount - 1);
      },
    }),
    [go, turnTo, leafCount],
  );

  // Pause the idle drift while the stage is scrolled out of view.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOffscreen(!entry.isIntersecting),
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Pointer-follow tilt, eased each frame; written straight to CSS vars.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const target = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    let raf = 0;

    const tick = () => {
      now.x += (target.x - now.x) * TILT_EASE;
      now.y += (target.y - now.y) * TILT_EASE;
      stage.style.setProperty("--px", now.x.toFixed(4));
      stage.style.setProperty("--py", now.y.toFixed(4));
      const settled =
        Math.abs(target.x - now.x) < 0.001 && Math.abs(target.y - now.y) < 0.001;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: globalThis.PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = stage.getBoundingClientRect();
      target.x = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
      target.y = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));
      kick();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };

    // The reader tracks the whole window; the inline preview only its frame.
    const scope: HTMLElement | Window = size === "reader" ? window : stage;
    scope.addEventListener("pointermove", onMove as EventListener);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      scope.removeEventListener("pointermove", onMove as EventListener);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, [size]);

  // A pinch/pan in the reader cancels any page drag a finger had started.
  useEffect(
    () =>
      onGestureStart(() => {
        pointer.current = null;
        setDrag(null);
      }),
    [],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || isGestureActive()) return;
    // Links and controls work normally instead of turning the page.
    if ((e.target as Element).closest("a, button")) return;
    pointer.current = {
      id: e.pointerId,
      x: e.clientX,
      t: e.timeStamp,
      moved: false,
      leaf: null,
      forward: true,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    // Button released outside the window: drop the drag instead of resuming it.
    if (e.pointerType === "mouse" && e.buttons === 0) {
      pointer.current = null;
      setDrag(null);
      return;
    }
    const dx = e.clientX - p.x;

    if (!p.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      p.moved = true;
      p.forward = dx < 0;
      p.leaf = p.forward
        ? current < leafCount
          ? current
          : null
        : current > 0
          ? current - 1
          : null;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (p.leaf === null) return;

    const pageWidth = (bookRef.current?.offsetWidth ?? 400) / 2;
    const travel = Math.min(1, Math.abs(dx) / (pageWidth * 1.2));
    const progress = p.forward
      ? dx < 0 ? travel : 0
      : dx > 0 ? 1 - travel : 1;
    setDrag({ leaf: p.leaf, progress });
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    pointer.current = null;

    if (!p.moved) {
      // Tap: right page advances, left page goes back.
      const rect = stageRef.current?.getBoundingClientRect();
      const mid = rect ? rect.left + rect.width / 2 : e.clientX;
      if (current === 0) go(1);
      else if (current === leafCount) go(-1);
      else go(e.clientX >= mid ? 1 : -1);
      return;
    }

    if (p.leaf !== null && drag) {
      // Released mid-air: the leaf swings on to wherever it settles.
      markMoving(p.leaf, p.leaf + 1);
      const velocity = (e.clientX - p.x) / Math.max(1, e.timeStamp - p.t);
      if (p.forward && (drag.progress > COMMIT_PROGRESS || velocity < -FLICK_VELOCITY)) {
        go(1);
      } else if (
        !p.forward &&
        (drag.progress < 1 - COMMIT_PROGRESS || velocity > FLICK_VELOCITY)
      ) {
        go(-1);
      }
    }
    setDrag(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  // Continuous position (0 = closed on cover, leafCount = closed on back).
  const position = drag ? drag.leaf + drag.progress : current;
  // Stacks count only leaves lying flat: not held, not still swinging.
  let leftLeaves = 0;
  let rightLeaves = 0;
  for (let i = 0; i < leafCount; i++) {
    if (drag?.leaf === i || moving.current.has(i)) continue;
    if (i < current) leftLeaves++;
    else rightLeaves++;
  }
  const frontClosed = Math.max(0, 1 - position);
  const backClosed = Math.max(0, position - (leafCount - 1));
  // Closed: the cover is centred. Open: the spread is centred.
  const shift = -25 * frontClosed + 25 * backClosed;

  const statusLabel =
    current === 0
      ? "Cover"
      : current === leafCount
        ? "Back cover"
        : `Spread ${current} of ${leafCount - 1}`;

  const handlers = interactive
    ? {
        role: "group",
        "aria-roledescription": "booklet",
        "aria-label": "Sketchbook. Swipe or use arrow keys to turn pages.",
        tabIndex: 0,
        onKeyDown,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
      }
    : { "aria-hidden": true };

  // Guest pages replay only in the open reader, on the spread showing them.
  const showing = size === "reader" && !paused && !drag;
  const leftKey = faces[current * 2 - 1]?.key;
  const rightKey = current < leafCount ? faces[current * 2]?.key : undefined;
  const visibleFaces = useMemo(
    () => new Set(showing ? [leftKey, rightKey].filter((k): k is string => !!k) : []),
    [showing, leftKey, rightKey],
  );

  return (
    <div
      ref={stageRef}
      className={[styles.stage, styles[size], className].filter(Boolean).join(" ")}
      data-dragging={drag ? "" : undefined}
      data-interactive={interactive ? "" : undefined}
      data-paused={paused || offscreen ? "" : undefined}
      data-drawing={interactive && pen ? "" : undefined}
      {...handlers}
    >
      <PagesShownContext.Provider value={showPages}>
      <VisibleFacesContext.Provider value={visibleFaces}>
      <DrawingContext.Provider value={interactive ? (pen ?? null) : undefined}>
        <div className={styles.float}>
          <div
            className={styles.book}
            ref={bookRef}
            data-booklet-book
            style={{
              ["--shift" as string]: `${shift}%`,
              ["--front-closed" as string]: frontClosed,
              ["--back-closed" as string]: backClosed,
              // Share of the page block lying flat on each side; a leaf mid-turn
              // counts for neither, so nothing appears under it as it lifts.
              ["--left-depth" as string]: leftLeaves / leafCount,
              ["--right-depth" as string]: rightLeaves / leafCount,
            }}
          >
            {/* Only where pages lie flat — none under the cover as it lifts. */}
            {leftLeaves > 0 ? (
              <span className={`${styles.block} ${styles.blockLeft}`} aria-hidden="true" />
            ) : null}
            {rightLeaves > 0 ? (
              <span className={`${styles.block} ${styles.blockRight}`} aria-hidden="true" />
            ) : null}
            {leaves.map((leaf, i) => {
              const isDragged = drag?.leaf === i;
              const progress = isDragged ? drag.progress : i < current ? 1 : 0;
              const flipped = progress >= 0.5;
              const z = flipped ? i * 0.6 : (leafCount - i) * 0.6;
              const angle = -180 * progress;
              return (
                <div
                  key={leaf.front.key}
                  className={styles.leaf}
                  data-dragged={isDragged ? "" : undefined}
                  style={{
                    ["--angle" as string]: `${angle}deg`,
                    ["--z" as string]: z + (isDragged ? 1 : 0),
                    ["--fold" as string]: Math.abs(Math.sin((angle / 180) * Math.PI)),
                  }}
                >
                  <div className={`${styles.face} ${styles.front} ${leaf.front.className}`}>
                    {leaf.front.node}
                    <span className={styles.gutter} />
                    <span className={styles.shade} />
                  </div>
                  <div className={`${styles.face} ${styles.backFace} ${leaf.back.className}`}>
                    {leaf.back.node}
                    <span className={styles.gutter} />
                    <span className={styles.shade} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DrawingContext.Provider>
      </VisibleFacesContext.Provider>
      </PagesShownContext.Provider>
      <span className={styles.shadow} aria-hidden="true" />
      {interactive ? (
        <>
          <div className={styles.counter}>
            <button
              type="button"
              className={styles.counterStep}
              aria-label="Previous page"
              disabled={current === 0}
              onClick={() => go(-1)}
            >
              ←
            </button>
            <span aria-hidden="true">
              {current + 1}/{leafCount + 1}
            </span>
            <button
              type="button"
              className={styles.counterStep}
              aria-label="Next page"
              disabled={current === leafCount}
              onClick={() => go(1)}
            >
              →
            </button>
          </div>
          <span className={styles.srOnly} aria-live="polite">
            {statusLabel}
          </span>
        </>
      ) : null}
    </div>
  );
}
