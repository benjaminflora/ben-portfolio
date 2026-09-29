import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getScrollPosition() {
  return window.scrollY;
}

export function restoreScrollPosition(top: number) {
  if (lenis) {
    lenis.scrollTo(top, { immediate: true, force: true });
  }

  window.scrollTo({ top, left: 0, behavior: "auto" });
}

export function setSmoothScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }

  document.body.style.overflow = locked ? "hidden" : "";
}

export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0);
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
}
