import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudy } from "@/components/case-study/CaseStudy";
import { Footer } from "@/components/sections/Footer";
import { getProject, projects } from "@/data/projects";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };

  const description = project.summary;

  return {
    title: `${project.name} — ${project.kicker}`,
    description,
    openGraph: {
      title: `${project.name} — ${project.kicker}`,
      description,
      type: "article",
      url: `/work/${project.slug}`,
    },
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Wraps around, so the case studies form a loop rather than a dead end.
  const i = projects.findIndex((p) => p.slug === slug);
  const next = projects[(i + 1) % projects.length];

  return (
    <>
      <CaseStudy project={project} next={next} />
      <Footer />
    </>
  );
}
