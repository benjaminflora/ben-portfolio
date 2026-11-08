"use client";

import { useEffect, useRef } from "react";
import { cursorColor, recordingLength, type GuestDrawing } from "@/lib/guestbook";
import { paintSegment } from "./paint";
import styles from "./GuestReplay.module.css";

/* A visitor's drawing replayed the way it was drawn, with a Figma-style
 * multiplayer cursor (coloured arrow + name tag) riding the pen tip.
 *
 * `playing` restarts the recording from a blank page; otherwise the finished
 * drawing is shown. Fills its parent (a sketchbook page, or the review page). */

interface GuestReplayProps {
  drawing: GuestDrawing;
  playing: boolean;
  /** Playback speed (1 = as drawn). */
  speed?: number;
  onDone?: () => void;
}

/** How long the cursor lingers after the last stroke before leaving. */
const LINGER_MS = 700;

export function GuestReplay({ drawing, playing, speed = 1, onDone }: GuestReplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  /** Points drawn so far, per stroke (so a resize can repaint them). */
  const progress = useRef<number[]>([]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const color = cursorColor(drawing.name);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!canvas || !cursor) return;
    const strokes = drawing.strokes;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = playing && !reduce;

    const setup = () => {
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
    const paintRange = (
      c: { ctx: CanvasRenderingContext2D; size: number },
      si: number,
      from: number,
      to: number,
    ) => {
      const stroke = strokes[si];
      const count = stroke.points.length / 3;
      for (let i = from; i < to; i++) {
        // A lone point is a dot; otherwise segments start at point 1.
        if (i === 0 && count > 1) continue;
        paintSegment(c.ctx, stroke, i, c.size);
      }
    };

    const repaint = () => {
      const c = setup();
      if (!c) return;
      progress.current.forEach((n, si) => paintRange(c, si, 0, n));
    };

    if (!animate) {
      progress.current = strokes.map((s) => s.t.length);
      repaint();
      cursor.dataset.state = "hidden";
      const observer = new ResizeObserver(repaint);
      observer.observe(canvas);
      return () => observer.disconnect();
    }

    progress.current = strokes.map(() => 0);
    let c = setup();
    const observer = new ResizeObserver(() => {
      c = setup();
      repaint();
    });
    observer.observe(canvas);

    const total = recordingLength(drawing);
    let start = 0;
    let raf = 0;
    let si = 0;
    cursor.dataset.state = "hidden";

    const place = (x: number, y: number) => {
      const size = canvas.offsetWidth;
      cursor.style.transform = `translate(${x * size}px, ${y * size}px)`;
    };

    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = (now - start) * speed;
      if (!c) c = setup();
      while (c && si < strokes.length) {
        const stroke = strokes[si];
        const done = progress.current[si];
        let upTo = done;
        while (upTo < stroke.t.length && stroke.t[upTo] <= elapsed) upTo++;
        if (upTo > done) {
          paintRange(c, si, done, upTo);
          progress.current[si] = upTo;
          const p = stroke.points;
          place(p[(upTo - 1) * 3], p[(upTo - 1) * 3 + 1]);
          cursor.dataset.state = "drawing";
        } else if (done === 0) {
          // Glide toward the next stroke's start during the pause before it.
          place(stroke.points[0], stroke.points[1]);
          if (cursor.dataset.state === "hidden") cursor.dataset.state = "drawing";
        }
        if (upTo < stroke.t.length) break;
        si++;
      }
      if (si >= strokes.length && elapsed > total + LINGER_MS) {
        cursor.dataset.state = "hidden";
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
  }, [drawing, playing, speed]);

  return (
    <div className={styles.replay} aria-label={`Drawing by ${drawing.name}`} role="img">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div
        ref={cursorRef}
        className={styles.cursor}
        data-state="hidden"
        style={{ ["--cursor-color" as string]: color }}
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
        <span className={styles.tag}>{drawing.name}</span>
      </div>
    </div>
  );
}
