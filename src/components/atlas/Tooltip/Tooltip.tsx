"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

const OFFSET_X = 12;
const OFFSET_Y = 14;

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ label, children, className }: TooltipProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  const classes = [styles.wrap, className].filter(Boolean).join(" ");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const bubble = bubbleRef.current;
    if (!wrap || !bubble) return;

    let hovering = false;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const setTransform = () => {
      bubble.style.transform = `translate(${x}px, ${y}px)`;
    };

    const updateTarget = (event: PointerEvent) => {
      targetX = event.clientX + OFFSET_X;
      targetY = event.clientY + OFFSET_Y;
    };

    const tick = () => {
      if (!hovering) return;
      const t = reduceMotion ? 1 : 0.22;
      x += (targetX - x) * t;
      y += (targetY - y) * t;
      setTransform();
      frame = window.requestAnimationFrame(tick);
    };

    const onEnter = (event: PointerEvent) => {
      updateTarget(event);
      x = targetX;
      y = targetY;
      setTransform();
      hovering = true;
      bubble.classList.add(styles.visible);
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      updateTarget(event);
      if (!hovering) {
        onEnter(event);
      }
    };

    const onLeave = () => {
      hovering = false;
      bubble.classList.remove(styles.visible);
      window.cancelAnimationFrame(frame);
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      hovering = false;
      window.cancelAnimationFrame(frame);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [mounted]);

  return (
    <span ref={wrapRef} className={classes}>
      {children}
      {mounted
        ? createPortal(
            <span ref={bubbleRef} className={styles.bubble} role="tooltip">
              <span className={styles.inner}>
                <span className={styles.text}>{label}</span>
              </span>
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
