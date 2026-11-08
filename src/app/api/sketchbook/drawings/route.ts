import { NextResponse } from "next/server";
import { cleanName, cleanStrokes, normaliseRecording } from "@/lib/guestbook";
import { listApproved, savePending, sendReviewEmail, signReview } from "@/lib/guestbook-server";

/* GET: approved guest drawings for the sketchbook.
 * POST: a visitor sends a drawing; it waits in "pending" and Ben gets an
 * email to review it. */

export async function GET() {
  try {
    const drawings = await listApproved();
    return NextResponse.json(
      { drawings },
      // Shared cache: a newly approved drawing shows up within a minute.
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("guestbook list failed", error);
    return NextResponse.json({ drawings: [] }, { status: 200 });
  }
}

// Light per-instance throttle; the review step is the real gate.
const recent = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const PER_WINDOW = 5;

function throttled(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > PER_WINDOW;
}

export async function POST(request: Request) {
  // Not wired up yet (email or signing secret missing): say so before saving.
  if (
    !process.env.SKETCHBOOK_SECRET ||
    !process.env.SKETCHBOOK_REVIEW_EMAIL ||
    !process.env.RESEND_API_KEY
  ) {
    return NextResponse.json(
      { error: "Sending drawings isn't switched on yet — check back soon!" },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) {
    return NextResponse.json({ error: "Too many drawings at once — try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Honeypot: a field people never see. Pretend it worked.
  if (typeof body.website === "string" && body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = cleanName(body.name);
  const strokes = cleanStrokes(body.strokes);
  if (!name) return NextResponse.json({ error: "Add your name (up to 32 characters)." }, { status: 400 });
  if (!strokes) return NextResponse.json({ error: "That drawing couldn't be read." }, { status: 400 });

  try {
    const drawing = await savePending({ name, strokes: normaliseRecording(strokes) });
    const origin = new URL(request.url).origin;
    const reviewUrl = `${origin}/sketchbook/review/${drawing.id}?token=${signReview(drawing.id)}`;
    await sendReviewEmail(drawing, reviewUrl);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("guestbook submit failed", error);
    return NextResponse.json({ error: "Couldn't send right now — try again in a bit." }, { status: 500 });
  }
}
