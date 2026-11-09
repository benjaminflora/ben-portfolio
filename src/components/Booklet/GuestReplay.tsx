"use client";

import { useEffect, useMemo, useRef } from "react";
import { cursorColor, recordingLength, type GuestDrawing, type GuestStroke } from "@/lib/guestbook";
import { paintSegment } from "./paint";
import styles from "./GuestReplay.module.css";

/* Visitor drawings replayed the way they were drawn, with Figma-style
 * multiplayer cursors (coloured arrow + name tag) riding each pen tip.
 *
 * A page can hold several people's drawings (`layers`); they all replay at
 * once, one cursor per person, so everyone can spot their own. `under`
 * layers are shown already drawn beneath them (e.g. the page someone added
 * to). `playing` restarts from a blank page; otherwise everything is shown
 * finished. Fills its parent (a sketchbook page, or the review page). */

interface GuestReplayProps {
  layers: GuestDrawing[];
  under?: GuestDrawing[];
  playing: boolean;
  /** Playback speed (1 = as drawn; defaults to a touch quicker). */
  speed?: number;
  onDone?: () => void;
}

/** Shared default for `under`, so re-renders don't look like a new page
 * (a fresh [] each render would restart the replay). */
const NO_LAYERS: GuestDrawing[] = [];
/** Replays run a quarter faster than drawn, so they stay lively. */
const PLAYBACK_SPEED = 1.25;
/** How long a cursor lingers after its last stroke before leaving. */
const LINGER_MS = 700;
/** Where the name tag sits relative to the pen point (matches the CSS), and
 * how close it may get to the page edge before switching sides. */
const TAG_OFFSET_X = 12;
const TAG_OFFSET_Y = 12;
const EDGE_GAP = 4;
/** Gap between the pen point and a tag that has switched sides. */
const FLIP_GAP = 4;
/** Narrowest a shortened tag gets (still shows a few letters and "…"). */
const MIN_TAG = 36;

type Painter = { ctx: CanvasRenderingContext2D; size: number };

/** Gentle ease in and out (sine) for the cursor's travel between strokes:
 * it starts and settles softly without lunging through the middle. */
function easeInOut(f: number) {
  return -(Math.cos(Math.PI * f) - 1) / 2;
}

export function GuestReplay({
  layers,
  under = NO_LAYERS,
  playing,
  speed = PLAYBACK_SPEED,
  onDone,
}: GuestReplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Points drawn so far, per person, per stroke (so a resize can repaint). */
  const progress = useRef<number[][]>([]);
  /** Which layers the canvas currently holds (to skip needless repaints). */
  const painted = useRef<unknown>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const people = useMemo(
    () =>
      layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        color: cursorColor(layer.name),
        strokes: layer.strokes,
        total: recordingLength(layer),
      })),
    [layers],
  );
  const underStrokes = useMemo(() => under.flatMap((d) => d.strokes), [under]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cursors = cursorRefs.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = playing && !reduce && people.some((p) => p.strokes.length > 0);

    const setup = (): Painter | null => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(canvas.offsetWidth * dpr);
      canvas.height = Math.round(canvas.offsetHeight * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      return { ctx, size: canvas.offsetWidth };
    };

    // Paints points [from, to) of one stroke.
    const paintRange = (c: Painter, stroke: GuestStroke, from: number, to: number) => {
      const count = stroke.points.length / 3;
      for (let i = from; i < to; i++) {
        // A lone point is a dot; otherwise segments start at point 1.
        if (i === 0 && count > 1) continue;
        paintSegment(c.ctx, stroke, i, c.size);
      }
    };

    const repaint = () => {
      const c = setup();
      if (!c) return c;
      for (const s of underStrokes) paintRange(c, s, 0, s.t.length);
      progress.current.forEach((perStroke, who) =>
        perStroke.forEach((n, si) => paintRange(c, people[who].strokes[si], 0, n)),
      );
      return c;
    };

    cursors.forEach((cursor) => cursor && (cursor.dataset.state = "hidden"));

    if (!animate) {
      // Stopping a replay (e.g. the page turned away): the canvas already
      // holds what was drawn, so only finish the strokes that hadn't played
      // yet — usually none. Repainting whole pages here stalled page turns.
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const sameSize =
        canvas.width === Math.round(canvas.offsetWidth * dpr) &&
        canvas.height === Math.round(canvas.offsetHeight * dpr);
      const ctx = canvas.getContext("2d");
      if (painted.current === people && sameSize && ctx) {
        const c = { ctx, size: canvas.offsetWidth };
        people.forEach((person, who) =>
          person.strokes.forEach((stroke, si) => {
            const from = progress.current[who]?.[si] ?? 0;
            if (from < stroke.t.length) paintRange(c, stroke, from, stroke.t.length);
          }),
        );
        progress.current = people.map((p) => p.strokes.map((s) => s.t.length));
      } else {
        progress.current = people.map((p) => p.strokes.map((s) => s.t.length));
        repaint();
        painted.current = people;
      }
      // Skip the observer's first call (it fires on observe) unless the size
      // actually changed since this paint.
      let lastWidth = canvas.offsetWidth;
      let lastHeight = canvas.offsetHeight;
      const observer = new ResizeObserver(() => {
        if (canvas.offsetWidth === lastWidth && canvas.offsetHeight === lastHeight) return;
        lastWidth = canvas.offsetWidth;
        lastHeight = canvas.offsetHeight;
        repaint();
      });
      observer.observe(canvas);
      return () => observer.disconnect();
    }

    painted.current = people;

    progress.current = people.map((p) => p.strokes.map(() => 0));
    let c = repaint();
    const observer = new ResizeObserver(() => {
      c = repaint();
    });
    observer.observe(canvas);

    const place = (cursor: HTMLDivElement, x: number, y: number) => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const px = x * width;
      const py = y * width;
      cursor.style.transform = `translate(${px}px, ${py}px)`;
      // The page clips its contents, so keep the name tag inside it: on the
      // side of the pen with more room, shortened with "…" if even that side
      // is too narrow (small pages, long names).
      const tag = cursor.lastElementChild as HTMLElement | null;
      if (!tag) return;
      tag.style.maxWidth = "";
      const natural = tag.offsetWidth;
      const roomRight = width - (px + TAG_OFFSET_X) - EDGE_GAP;
      const roomLeft = px - FLIP_GAP - EDGE_GAP;
      const flipX = natural > roomRight && roomLeft > roomRight;
      const room = flipX ? roomLeft : roomRight;
      if (natural > room) tag.style.maxWidth = `${Math.max(MIN_TAG, room)}px`;
      const tall = tag.offsetHeight;
      const flipY =
        py + TAG_OFFSET_Y + tall + EDGE_GAP > height && py - FLIP_GAP - tall >= EDGE_GAP;
      cursor.toggleAttribute("data-flip-x", flipX);
      cursor.toggleAttribute("data-flip-y", flipY);
    };

    /** Next stroke to work on, per person. */
    const next = people.map(() => 0);
    const longest = Math.max(...people.map((p) => p.total));
    let start = 0;
    let raf = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = (now - start) * speed;
      if (!c) c = repaint();

      people.forEach((person, who) => {
        const cursor = cursors[who];
        if (!c || !cursor) return;
        const done = progress.current[who];
        while (next[who] < person.strokes.length) {
          const si = next[who];
          const stroke = person.strokes[si];
          let upTo = done[si];
          while (upTo < stroke.t.length && stroke.t[upTo] <= elapsed) upTo++;
          if (upTo > done[si]) {
            paintRange(c, stroke, done[si], upTo);
            done[si] = upTo;
            const p = stroke.points;
            place(cursor, p[(upTo - 1) * 3], p[(upTo - 1) * 3 + 1]);
            cursor.dataset.state = "drawing";
          } else if (done[si] === 0 && si > 0) {
            // Pen up between strokes: travel from where the last stroke
            // ended to where this one starts, over the recorded pause.
            const prev = person.strokes[si - 1];
            const n = prev.t.length;
            const from = prev.t[n - 1];
            const to = stroke.t[0];
            const f = to > from ? Math.min(1, Math.max(0, (elapsed - from) / (to - from))) : 1;
            const e = easeInOut(f);
            const [x0, y0] = [prev.points[(n - 1) * 3], prev.points[(n - 1) * 3 + 1]];
            const [x1, y1] = [stroke.points[0], stroke.points[1]];
            place(cursor, x0 + (x1 - x0) * e, y0 + (y1 - y0) * e);
          }
          if (upTo < stroke.t.length) break;
          next[who]++;
        }
        // Finished: linger a moment, then leave.
        if (next[who] >= person.strokes.length && elapsed > person.total + LINGER_MS) {
          cursor.dataset.state = "hidden";
        }
      });

      if (elapsed > longest + LINGER_MS) {
        onDoneRef.current?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [people, underStrokes, playing, speed]);

  const label = layers.map((l) => l.name).join(", ");

  return (
    <div className={styles.replay} aria-label={`Drawing by ${label}`} role="img">
      <canvas ref={canvasRef} className={styles.canvas} />
      {people.map((person, who) => (
        <div
          key={person.id}
          ref={(el) => {
            cursorRefs.current[who] = el;
          }}
          className={styles.cursor}
          data-state="hidden"
          style={{ ["--cursor-color" as string]: person.color }}
          aria-hidden="true"
        >
          <svg className={styles.arrow} width="16" height="16" viewBox="0 0 16 16">
            <path
              d="M1.5 1.2v12.1c0 .4.5.6.8.3l2.9-2.8 1.9 4.2c.1.3.4.4.7.3l1.4-.6c.3-.1.4-.4.3-.7L7.6 9.8l4-.2c.4 0 .6-.5.3-.8L2.3.9c-.3-.3-.8-.1-.8.3z"
              fill="var(--cursor-color)"
              stroke="#fff"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.tag}>{person.name}</span>
        </div>
      ))}
    </div>
  );
}
