/* Zoom/pan gesture in the reader (two-finger pinch, or one-finger pan while
 * zoomed). While one is running, page turns and pen strokes stand down, and
 * anything a finger had already started is cancelled. */

let active = false;
const startListeners = new Set<() => void>();

export function setGestureActive(next: boolean) {
  if (next === active) return;
  active = next;
  if (next) startListeners.forEach((listener) => listener());
}

export function isGestureActive() {
  return active;
}

/** Called when a gesture begins; returns an unsubscribe. */
export function onGestureStart(listener: () => void) {
  startListeners.add(listener);
  return () => {
    startListeners.delete(listener);
  };
}
