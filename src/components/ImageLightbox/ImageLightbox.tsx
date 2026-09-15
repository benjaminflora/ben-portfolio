"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/atlas";
import { setSmoothScrollLocked } from "@/components/SmoothScroll";
import styles from "./ImageLightbox.module.css";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.focus();
    setSmoothScrollLocked(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      setSmoothScrollLocked(false);
      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.close}>
          <Button onClick={onClose}>Close</Button>
        </div>
        <img src={src} alt={alt} className={styles.image} />
      </div>
    </div>,
    document.body,
  );
}
