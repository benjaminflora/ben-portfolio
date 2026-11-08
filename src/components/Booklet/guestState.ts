import { useSyncExternalStore } from "react";
import type { GuestDrawing } from "@/lib/guestbook";

/* Approved visitor drawings, fetched once per visit and shared by every copy
 * of the sketchbook (the hero preview and the reader must have the same pages
 * for the hand-off between them). */

const EMPTY: GuestDrawing[] = [];
let drawings: GuestDrawing[] = EMPTY;
let requested = false;
const listeners = new Set<() => void>();

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
  load();
  return () => listeners.delete(listener);
}

export function useGuestDrawings() {
  return useSyncExternalStore(
    subscribe,
    () => drawings,
    () => EMPTY,
  );
}
