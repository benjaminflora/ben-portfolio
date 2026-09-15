"use client";

import { useLoadInAnimation } from "./FadeInProvider";
import styles from "./FadeInBlock.module.css";

interface FadeInBlockProps {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}

export function FadeInBlock({
  children,
  className,
  delay = "1s",
}: FadeInBlockProps) {
  const shouldAnimate = useLoadInAnimation();
  const classes = [styles.wrap, className].filter(Boolean).join(" ");
  const itemClass =
    shouldAnimate === false
      ? `${styles.item} ${styles.itemStatic}`
      : styles.item;

  return (
    <div className={classes}>
      <div
        className={itemClass}
        data-fade-item
        style={{ ["--delay" as string]: delay }}
      >
        {children}
      </div>
    </div>
  );
}
