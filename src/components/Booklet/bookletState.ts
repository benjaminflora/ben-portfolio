import { useSyncExternalStore } from "react";

/* Shared open state for the full-screen booklet, so the nav can show where you
 * are and offer the way back while the reader is up. */

let open = false;
let closeHandler: (() => void) | null = null;
const listeners = new Set<() => void>();

export function setBookletOpen(next: boolean, onClose: (() => void) | null) {
  open = next;
  closeHandler = next ? onClose : null;
  listeners.forEach((listener) => listener());
}

let closedWaiters: (() => void)[] = [];

/** Starts closing the reader; resolves once its outro has fully played. */
export function closeBooklet(): Promise<void> {
  if (!open || !closeHandler) return Promise.resolve();
  const handler = closeHandler;
  return new Promise((resolve) => {
    closedWaiters.push(resolve);
    handler();
  });
}

/** Called by the viewer when the reader has finished closing. */
export function notifyBookletClosed() {
  const waiters = closedWaiters;
  closedWaiters = [];
  waiters.forEach((resolve) => resolve());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBookletOpen() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}
