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
  // Hiding the scrollbar widens the page; pad by its width (body, and the
  // fixed nav via --scroll-lock-gap) so nothing shifts sideways.
  const root = document.documentElement;
  const gap = locked ? window.innerWidth - root.clientWidth : 0;
  root.style.setProperty("--scroll-lock-gap", `${gap}px`);
  document.body.style.paddingRight = gap ? `${gap}px` : "";

  if (lenis) {
    if (locked) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }

  // The root owns the always-on scrollbar, so lock it there.
  root.style.overflow = locked ? "hidden" : "";
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

/** Rendered height of the fixed nav, including the notch inset.
 *  --nav-height is a calc(), so it can't be parsed off the custom property. */
function navOffset() {
  const headers = document.querySelectorAll("header");
  for (const header of headers) {
    if (getComputedStyle(header).position !== "fixed") continue;
    const height = header.getBoundingClientRect().height;
    if (height > 0) return height;
  }

  const parsed = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
  );
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Smooth-scrolls an element to the top of the viewport, below the fixed nav. */
export function scrollToElement(element: HTMLElement) {
  const offset = -navOffset();

  if (lenis) {
    // Slow, eased glide rather than Lenis's quick default.
    lenis.scrollTo(element, {
      offset,
      force: true,
      duration: 1.4,
      easing: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
    });
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY + offset,
    left: 0,
    behavior: reduceMotion ? "auto" : "smooth",
  });
}
