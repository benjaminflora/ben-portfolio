import { useSyncExternalStore } from "react";
import type { PenId } from "./pens";

/* Pen in hand and the drawings made on the pages, with undo/redo across the
 * whole book. Module-level so it survives closing the reader. */

export interface SketchbookState {
  /** Pen in hand, if any. */
  pen: PenId | null;
  /** Kuru Toga engine turns, one per stroke (9° each). */
  engine: number;
  /** Bumps whenever strokes change outside of live drawing, so pages repaint. */
  revision: number;
  canUndo: boolean;
  canRedo: boolean;
}

/** Points are [x, y, width] triples, normalised to the page width. */
export type Stroke = { pen: PenId; points: number[] };

type Entry = { pageId: string; stroke: Stroke };

let state: SketchbookState = {
  pen: null,
  engine: 0,
  revision: 0,
  canUndo: false,
  canRedo: false,
};
const listeners = new Set<() => void>();

export const strokes = new Map<string, Stroke[]>();
const done: Entry[] = [];
const undone: Entry[] = [];

export function updateSketchbook(patch: Partial<SketchbookState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function historyChanged(repaint: boolean) {
  updateSketchbook({
    canUndo: done.length > 0,
    canRedo: undone.length > 0,
    revision: repaint ? state.revision + 1 : state.revision,
  });
}

/** Starts a stroke on a page; the caller keeps appending points to it. */
export function addStroke(pageId: string, stroke: Stroke) {
  strokes.set(pageId, [...(strokes.get(pageId) ?? []), stroke]);
  done.push({ pageId, stroke });
  undone.length = 0;
  historyChanged(false);
}

/** Drops a stroke outright (no redo), e.g. a finger that became a pinch. */
export function discardStroke(pageId: string, stroke: Stroke) {
  strokes.set(
    pageId,
    (strokes.get(pageId) ?? []).filter((s) => s !== stroke),
  );
  const index = done.findIndex((entry) => entry.stroke === stroke);
  if (index >= 0) done.splice(index, 1);
  historyChanged(true);
}

export function undo() {
  const entry = done.pop();
  if (!entry) return;
  strokes.set(
    entry.pageId,
    (strokes.get(entry.pageId) ?? []).filter((stroke) => stroke !== entry.stroke),
  );
  undone.push(entry);
  historyChanged(true);
}

export function redo() {
  const entry = undone.pop();
  if (!entry) return;
  strokes.set(entry.pageId, [...(strokes.get(entry.pageId) ?? []), entry.stroke]);
  done.push(entry);
  historyChanged(true);
}

export function turnEngine() {
  updateSketchbook({ engine: state.engine + 1 });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const initial = state;

export function useSketchbook() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}
