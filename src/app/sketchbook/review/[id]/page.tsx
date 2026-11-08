import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readForReview, verifyReview } from "@/lib/guestbook-server";
import { ReviewPanel } from "./ReviewPanel";

/* Ben's review page for a visitor's drawing, linked from the review email.
 * The signed token in the link is the only key; without it this 404s. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review drawing",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token = "" } = await searchParams;
  if (!verifyReview(id, token)) notFound();

  const found = await readForReview(id);
  if (!found) {
    return <ReviewPanel id={id} token={token} drawing={null} initialStatus="gone" />;
  }
  return (
    <ReviewPanel id={id} token={token} drawing={found.drawing} initialStatus={found.status} />
  );
}
