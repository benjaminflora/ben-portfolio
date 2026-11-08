import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectSection } from "@/components/ProjectSection";
import { projectCategories } from "@/data/projects";

/* One page per nav tab (/art, /writing, …): just that tab's content. Design
 * is the "Home" tab and lives on the home page, so /design goes there. */

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export const dynamicParams = false;

function findCategory(key: string) {
  return projectCategories.find(
    (category) => category.key === key && !category.disabled && !category.hidden,
  );
}

export function generateStaticParams() {
  return projectCategories
    .filter((category) => !category.disabled && !category.hidden)
    .map((category) => ({ category: category.key }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = findCategory((await params).category);
  return { title: `${category?.label ?? "Not found"} — Benjamin Flora` };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = findCategory((await params).category);
  if (!category) notFound();
  if (category.key === "design") redirect("/");
  return <ProjectSection category={category.key} />;
}
