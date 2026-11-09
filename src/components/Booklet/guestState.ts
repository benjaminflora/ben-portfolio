import { useSyncExternalStore } from "react";
import type { GuestDrawing } from "@/lib/guestbook";

/* Approved visitor drawings, fetched once per visit and shared by every copy
 * of the sketchbook (the hero preview and the reader must have the same pages
 * for the hand-off between them).
 *
 * Not needed for the first paint (the hero book is closed), so the request
 * waits until the page has loaded and the browser is idle — or goes out right
 * away when someone opens the sketchbook first. */

const EMPTY: GuestDrawing[] = [];
let drawings: GuestDrawing[] = EMPTY;
let requested = false;
let scheduled = false;
const listeners = new Set<() => void>();

/** Fetches now (e.g. the reader is opening). */
export function loadGuestDrawings() {
  load();
}

function scheduleLoad() {
  if (scheduled || requested || typeof window === "undefined") return;
  scheduled = true;
  const whenIdle = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 4000 });
    else setTimeout(load, 1500);
  };
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}

function load() {
  if (requested || typeof window === "undefined") return;
  requested = true;
  fetch("/api/sketchbook/drawings")
    .then((response) => (response.ok ? response.json() : { drawings: [] }))
    .then((data: { drawings?: GuestDrawing[] }) => {
      if (!data.drawings?.length) return;
      drawings = data.drawings;
      listeners.forEach((listener) => listener());
    })
    .catch(() => {
      // The sketchbook works fine with just Ben's pages.
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  scheduleLoad();
  return () => listeners.delete(listener);
}

export function useGuestDrawings() {
  return useSyncExternalStore(
    subscribe,
    () => drawings,
    () => EMPTY,
  );
}
