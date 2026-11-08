import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { setGestureActive } from "./gestureState";

/* Pinch-zoom for the reader's book. Two fingers zoom (1–3×) and pan; one
 * finger pans while zoomed in, unless a pen is in hand (then it draws). On
 * desktop, a trackpad pinch (ctrl + wheel) zooms and the wheel pans. */

const MIN = 1;
const MAX = 3;
/** Finger travel before a one-finger touch counts as a pan, not a tap. Below
 * the book's page-drag threshold (6px), so a zoomed-in drag pans first. */
const PAN_SLOP = 4;

type View = { s: number; x: number; y: number };

export function useReaderZoom(
  areaRef: RefObject<HTMLElement | null>,
  layerRef: RefObject<HTMLElement | null>,
  { penInHand, enabled }: { penInHand: boolean; enabled: boolean },
) {
  const view = useRef<View>({ s: 1, x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);
  const pen = useRef(penInHand);
  pen.current = penInHand;

  const apply = useCallback(
    (next: View, animate = false) => {
      const layer = layerRef.current;
      if (!layer) return;
      // Keep the book covering the area: no panning past its edges.
      const w = layer.offsetWidth;
      const h = layer.offsetHeight;
      const s = Math.min(MAX, Math.max(MIN, next.s));
      const x = Math.min(0, Math.max(w * (1 - s), next.x));
      const y = Math.min(0, Math.max(h * (1 - s), next.y));
      view.current = { s, x, y };
      layer.style.transition = animate ? "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none";
      layer.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
      setZoomed(s > 1.01);
    },
    [layerRef],
  );

  const reset = useCallback(() => apply({ s: 1, x: 0, y: 0 }, true), [apply]);

  useEffect(() => {
    const area = areaRef.current;
    const layer = layerRef.current;
    if (!enabled || !area || !layer) return;

    /** Point relative to the layer's untransformed top-left. */
    const local = (clientX: number, clientY: number) => {
      const box = layer.parentElement!.getBoundingClientRect();
      return { x: clientX - box.left - layer.offsetLeft, y: clientY - box.top - layer.offsetTop };
    };

    /** Scale to `s` while keeping content point under `from` beneath `to`. */
    const zoomAround = (start: View, s: number, from: { x: number; y: number }, to: { x: number; y: number }) => {
      const contentX = (from.x - start.x) / start.s;
      const contentY = (from.y - start.y) / start.s;
      apply({ s, x: to.x - contentX * s, y: to.y - contentY * s });
    };

    let pinch: { d0: number; mid0: { x: number; y: number }; start: View } | null = null;
    let pan: { x0: number; y0: number; start: View; moving: boolean } | null = null;

    const touchPoints = (e: TouchEvent) => {
      const [a, b] = [e.touches[0], e.touches[1]];
      const pa = local(a.clientX, a.clientY);
      const pb = local(b.clientX, b.clientY);
      return {
        d: Math.hypot(pa.x - pb.x, pa.y - pb.y),
        mid: { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 },
      };
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        const { d, mid } = touchPoints(e);
        pinch = { d0: Math.max(1, d), mid0: mid, start: { ...view.current } };
        pan = null;
        setGestureActive(true);
      } else if (e.touches.length === 1 && view.current.s > 1.01 && !pen.current) {
        const t = e.touches[0];
        pan = { x0: t.clientX, y0: t.clientY, start: { ...view.current }, moving: false };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (pinch && e.touches.length >= 2) {
        e.preventDefault();
        const { d, mid } = touchPoints(e);
        zoomAround(pinch.start, pinch.start.s * (d / pinch.d0), pinch.mid0, mid);
      } else if (pan && e.touches.length === 1) {
        const t = e.touches[0];
        const dx = t.clientX - pan.x0;
        const dy = t.clientY - pan.y0;
        if (!pan.moving && Math.hypot(dx, dy) < PAN_SLOP) return;
        if (!pan.moving) {
          pan.moving = true;
          setGestureActive(true);
        }
        e.preventDefault();
        apply({ s: pan.start.s, x: pan.start.x + dx, y: pan.start.y + dy });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      // Stay in the gesture until every finger lifts, so the one left behind
      // after a pinch doesn't suddenly draw or turn a page.
      if (e.touches.length > 0) return;
      pinch = null;
      pan = null;
      setGestureActive(false);
      if (view.current.s < 1.05) reset();
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        // Trackpad pinch arrives as ctrl + wheel.
        e.preventDefault();
        const p = local(e.clientX, e.clientY);
        const start = { ...view.current };
        zoomAround(start, start.s * Math.exp(-e.deltaY * 0.01), p, p);
      } else if (view.current.s > 1.01) {
        e.preventDefault();
        const v = view.current;
        apply({ s: v.s, x: v.x - e.deltaX, y: v.y - e.deltaY });
      }
    };

    area.addEventListener("touchstart", onTouchStart, { passive: false });
    area.addEventListener("touchmove", onTouchMove, { passive: false });
    area.addEventListener("touchend", onTouchEnd);
    area.addEventListener("touchcancel", onTouchEnd);
    area.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      area.removeEventListener("touchstart", onTouchStart);
      area.removeEventListener("touchmove", onTouchMove);
      area.removeEventListener("touchend", onTouchEnd);
      area.removeEventListener("touchcancel", onTouchEnd);
      area.removeEventListener("wheel", onWheel);
      setGestureActive(false);
    };
  }, [enabled, areaRef, layerRef, apply, reset]);

  return { zoomed, reset };
}
