import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { del, get, list, put, rename } from "@vercel/blob";
import type { GuestDrawing } from "./guestbook";

/* Server side of the guestbook: drawings live in the private Blob store as
 * pending/<id>.json until Ben approves them (→ approved/<id>.json) or rejects
 * them (deleted). Approve/reject links are signed, so only someone with the
 * email can act on them. */

const PENDING = "pending/";
const APPROVED = "approved/";
const ID = /^[a-f0-9-]{36}$/;

function secret() {
  const value = process.env.SKETCHBOOK_SECRET;
  if (!value) throw new Error("SKETCHBOOK_SECRET is not set");
  return value;
}

export function isDrawingId(id: string) {
  return ID.test(id);
}

/** Token for Ben's review link for one drawing. */
export function signReview(id: string) {
  return createHmac("sha256", secret()).update(`review:${id}`).digest("base64url");
}

export function verifyReview(id: string, token: string) {
  if (!isDrawingId(id) || !token) return false;
  const expected = Buffer.from(signReview(id));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

async function readJson(pathname: string): Promise<GuestDrawing | null> {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return (await new Response(result.stream).json()) as GuestDrawing;
}

export async function savePending(drawing: Omit<GuestDrawing, "id" | "createdAt">) {
  const full: GuestDrawing = { id: randomUUID(), createdAt: new Date().toISOString(), ...drawing };
  await put(`${PENDING}${full.id}.json`, JSON.stringify(full), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  });
  return full;
}

/** A drawing and whether it's still waiting for review. */
export async function readForReview(id: string) {
  const pending = await readJson(`${PENDING}${id}.json`);
  if (pending) return { drawing: pending, status: "pending" as const };
  const approved = await readJson(`${APPROVED}${id}.json`);
  if (approved) return { drawing: approved, status: "approved" as const };
  return null;
}

export async function approve(id: string) {
  await rename(`${PENDING}${id}.json`, `${APPROVED}${id}.json`, {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function reject(id: string) {
  await del(`${PENDING}${id}.json`);
}

/** Approved drawings, oldest first (so new ones join at the back). */
export async function listApproved(): Promise<GuestDrawing[]> {
  const { blobs } = await list({ prefix: APPROVED, limit: 200 });
  const drawings = await Promise.all(blobs.map((blob) => readJson(blob.pathname)));
  return drawings
    .filter((d): d is GuestDrawing => d !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Emails Ben a link to review a new drawing. */
export async function sendReviewEmail(drawing: GuestDrawing, reviewUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SKETCHBOOK_REVIEW_EMAIL;
  if (!apiKey || !to) throw new Error("RESEND_API_KEY / SKETCHBOOK_REVIEW_EMAIL not set");
  const from = process.env.SKETCHBOOK_FROM_EMAIL ?? "Sketchbook <onboarding@resend.dev>";
  const name = escapeHtml(drawing.name);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `${drawing.name} drew something for your sketchbook`,
      html: `
        <div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#111">
          <p><strong>${name}</strong> sent a drawing for your sketchbook (${drawing.strokes.length} strokes).</p>
          <p>Watch it being drawn, then approve or reject it:</p>
          <p><a href="${reviewUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Review drawing</a></p>
          <p style="color:#888;font-size:13px">Nothing is published until you approve it.</p>
        </div>`,
      text: `${drawing.name} sent a drawing for your sketchbook.\n\nReview it: ${reviewUrl}\n\nNothing is published until you approve it.`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${await response.text()}`);
  }
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}
