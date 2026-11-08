import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WritingArticle } from "@/components/WritingArticle";
import { getWritingPiece, writingPieces } from "@/data/writing";

interface WritingPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return writingPieces.map((piece) => ({ slug: piece.slug }));
}

export async function generateMetadata({ params }: WritingPageProps): Promise<Metadata> {
  const piece = getWritingPiece((await params).slug);
  return {
    title: `${piece?.title ?? "Not found"} — Benjamin Flora`,
    description: piece?.sections[0]?.paragraphs[0],
  };
}

export default async function WritingPage({ params }: WritingPageProps) {
  const piece = getWritingPiece((await params).slug);
  if (!piece) notFound();
  return <WritingArticle piece={piece} />;
}
