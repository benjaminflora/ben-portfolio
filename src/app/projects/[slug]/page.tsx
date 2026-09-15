import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/CaseStudy";
import { getCaseStudyDescription, getCaseStudyProjects, getProjectBySlug } from "@/data/projects";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getCaseStudyProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project?.caseStudy || project.disabled) {
    return { title: "Not found — Benjamin Flora" };
  }

  const description = getCaseStudyDescription(project.caseStudy);

  return {
    title: `${project.title} — Benjamin Flora`,
    description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project?.caseStudy || project.disabled) {
    notFound();
  }

  return <CaseStudy project={project} />;
}
