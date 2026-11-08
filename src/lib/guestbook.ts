import { PENS, type PenId } from "@/components/Booklet/pens";

/* Visitor drawings sent to Ben for the sketchbook's guest pages.
 *
 * A drawing is a recording: every stroke keeps its pen, its points (x, y,
 * width — normalised to the page width, as the sketchbook draws them) and the
 * time each point was laid down, so it can be replayed at the pace it was
 * drawn. Shared by the browser (capture, replay) and the server (checks). */

export interface GuestStroke {
  pen: PenId;
  /** [x, y, width] triples over the page width. */
  points: number[];
  /** Milliseconds from the start of the drawing, one per point. */
  t: number[];
}

export interface GuestDrawing {
  id: string;
  name: string;
  /** ISO date the drawing was sent. */
  createdAt: string;
  strokes: GuestStroke[];
}

export const NAME_MAX = 32;
const MAX_STROKES = 600;
const MAX_POINTS = 40_000;
/** Long pauses (thinking, picking a pen) play back no longer than this. */
const MAX_PAUSE_MS = 900;

const PEN_IDS = new Set<string>(PENS.map((pen) => pen.id));

/** Trims and checks a visitor's name; null if unusable. */
export function cleanName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // Drop control characters and collapse whitespace.
  // eslint-disable-next-line no-control-regex
  const name = raw.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
  if (!name || name.length > NAME_MAX) return null;
  return name;
}

/** Checks strokes from an untrusted body; null if anything is off. */
export function cleanStrokes(raw: unknown): GuestStroke[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_STROKES) return null;
  let total = 0;
  const out: GuestStroke[] = [];
  for (const s of raw) {
    if (!s || typeof s !== "object") return null;
    const { pen, points, t } = s as Record<string, unknown>;
    if (typeof pen !== "string" || !PEN_IDS.has(pen)) return null;
    if (!Array.isArray(points) || !Array.isArray(t)) return null;
    if (points.length === 0 || points.length % 3 !== 0 || t.length !== points.length / 3) {
      return null;
    }
    total += t.length;
    if (total > MAX_POINTS) return null;
    const ok =
      points.every((n) => typeof n === "number" && Number.isFinite(n) && n > -0.5 && n < 2) &&
      t.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n < 3_600_000);
    if (!ok) return null;
    out.push({ pen: pen as PenId, points: points as number[], t: t as number[] });
  }
  return out;
}

/** Starts the clock at the first point, shortens long pauses and rounds the
 * numbers, so recordings stay small and replays don't stall. */
export function normaliseRecording(strokes: GuestStroke[]): GuestStroke[] {
  let clock = 0;
  let last: number | null = null;
  return strokes.map((stroke) => {
    const t = stroke.t.map((time) => {
      if (last !== null) clock += Math.min(MAX_PAUSE_MS, Math.max(0, time - last));
      last = time;
      return Math.round(clock);
    });
    const points = stroke.points.map((n, i) =>
      Math.round(n * (i % 3 === 2 ? 1e5 : 1e4)) / (i % 3 === 2 ? 1e5 : 1e4),
    );
    return { pen: stroke.pen, points, t };
  });
}

export function recordingLength(drawing: GuestDrawing) {
  const last = drawing.strokes[drawing.strokes.length - 1];
  return last ? last.t[last.t.length - 1] : 0;
}

/** Multiplayer-cursor colours, one per name (stable across visits). */
const CURSOR_COLORS = ["#0d99ff", "#9747ff", "#f24822", "#14ae5c", "#ffa629", "#e83e8c", "#1bc4c4"];

export function cursorColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}
