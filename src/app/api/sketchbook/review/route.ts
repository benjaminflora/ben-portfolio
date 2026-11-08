import { NextResponse } from "next/server";
import { approve, readForReview, reject, verifyReview } from "@/lib/guestbook-server";

/* Ben's decision on a drawing, from the review page. Needs the signed token
 * from the review email. */
export async function POST(request: Request) {
  let body: { id?: unknown; token?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const token = typeof body.token === "string" ? body.token : "";
  if (!verifyReview(id, token)) {
    return NextResponse.json({ error: "This link isn't valid." }, { status: 403 });
  }
  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const current = await readForReview(id);
  if (!current) return NextResponse.json({ error: "Already handled." }, { status: 404 });
  if (current.status !== "pending") {
    return NextResponse.json({ status: current.status });
  }

  if (body.action === "approve") await approve(id);
  else await reject(id);
  return NextResponse.json({ status: body.action === "approve" ? "approved" : "rejected" });
}
