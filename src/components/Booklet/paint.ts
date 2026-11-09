import { PEN_BY_ID, type PenId } from "./pens";

/* Painting ink onto a page canvas, shared by the sketchbook's drawing pages
 * and the guest-drawing replays so both lay down identical marks. */

/** Anything with a pen and [x, y, width] points over the page width. */
export type PaintableStroke = { pen: PenId; points: number[]; color?: string };

/** Stable per-segment noise so graphite repaints with the same grain. */
function grain(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Draws the segment ending at point `i` (or a dot for a single point). */
export function paintSegment(ctx: CanvasRenderingContext2D, stroke: PaintableStroke, i: number, size: number) {
  const pen = PEN_BY_ID[stroke.pen];
  const p = stroke.points;
  const [x1, y1, w1] = [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]];
  ctx.globalCompositeOperation = pen.kind === "eraser" ? "destination-out" : "source-over";
  ctx.globalAlpha = pen.kind === "graphite" ? pen.alpha * (0.7 + 0.3 * grain(i)) : pen.alpha;
  // A chosen colour replaces the pen's own (not for the eraser).
  const ink = pen.kind !== "eraser" && stroke.color ? stroke.color : pen.ink;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  // Water-based dye wicks into the paper a little past the nib.
  const width = (i === 0 ? w1 : (p[i * 3 - 1] + w1) / 2) * size;
  ctx.shadowColor = pen.kind === "ink" ? `${ink}24` : "transparent";
  ctx.shadowBlur = pen.kind === "ink" ? width * ctx.getTransform().a * 1.4 : 0;
  if (i === 0) {
    ctx.beginPath();
    ctx.arc(x1 * size, y1 * size, (w1 * size) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const [x0, y0] = [p[i * 3 - 3], p[i * 3 - 2]];
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0 * size, y0 * size);
  ctx.lineTo(x1 * size, y1 * size);
  ctx.stroke();
}

