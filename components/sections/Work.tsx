"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

import { ProjectVisual } from "@/components/case-study/ProjectVisual";
import { Counter } from "@/components/ui/Counter";
import { MaskText } from "@/components/ui/MaskText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects, type Project } from "@/data/projects";
import { riseDelay } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";

function ProjectRow({ project, i }: { project: Project; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], ["7%", "-7%"]);
  const flip = i % 2 === 1;

  return (
    <article
      ref={ref}
      className="group relative border-t border-line py-[clamp(3rem,8vh,6rem)]"
    >
      {/* Amber wash on approach — the row acknowledges the cursor */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-amber/[0.045] to-transparent opacity-0 transition-opacity duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:opacity-100"
      />

      <div
        className={cn(
          "grid items-start gap-x-10 gap-y-8 lg:grid-cols-12",
        )}
      >
        {/* -------------------------------------------------- the text block */}
        <div
          className={cn(
            "flex flex-col gap-7 lg:col-span-5",
            flip ? "lg:order-2 lg:col-start-8" : "lg:order-1",
          )}
        >
          <div className="flex items-baseline gap-5">
            <span className="display text-[clamp(2.5rem,5vw,4.5rem)] text-faint transition-colors duration-700 group-hover:text-amber">
              {project.index}
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="label text-amber">{project.kicker}</span>
              <span className="label text-dim">
                {project.period} ·{" "}
                <span
                  className={cn(
                    project.status === "In progress" ? "text-bone" : "text-dim",
                  )}
                >
                  {project.status}
                </span>
              </span>
            </div>
          </div>

          <div>
            <Link
              href={`/work/${project.slug}`}
              data-cursor="View case study"
              className="inline-block"
            >
              <MaskText
                as="h3"
                lines={[project.name]}
                className="display text-[clamp(2.125rem,4.4vw,3.75rem)] text-bone transition-colors duration-500 group-hover:text-amber"
              />
            </Link>
            <p className="mt-4 max-w-[34ch] font-serif text-[clamp(1.0625rem,1.5vw,1.375rem)] italic leading-[1.4] text-ash">
              {project.tagline}
            </p>
          </div>

          <p
            data-rise="up"
            style={riseDelay(1)}
            className="max-w-[48ch] text-[1.0625rem] leading-[1.65] text-ash"
          >
            {project.summary}
          </p>

          {/* Metrics ledger */}
          <dl className="grid grid-cols-3 gap-x-5 gap-y-4 border-t border-line pt-6">
            {project.metrics.map((m, j) => (
              <div
                key={m.label}
                data-rise="up"
                style={riseDelay(j, 150)}
                className="min-w-0"
              >
                <dd>
                  <Counter
                    value={m.value}
                    className="display block text-[clamp(1.125rem,2vw,1.75rem)] tabular-nums text-bone"
                  />
                </dd>
                <dt className="label mt-2 block text-dim">{m.label}</dt>
              </div>
            ))}
          </dl>

          {/* Stack tags */}
          <ul className="flex flex-wrap gap-x-2 gap-y-2">
            {project.stack.flatMap((g) => g.items).slice(0, 7).map((item) => (
              <li
                key={item}
                className="label rounded-full border border-line px-3 py-1.5 text-dim"
              >
                {item}
              </li>
            ))}
          </ul>

          <Link
            href={`/work/${project.slug}`}
            data-cursor="View case study"
            className="group/cta inline-flex items-center gap-3 self-start border-b border-line-strong pb-1.5 text-bone transition-colors duration-500 hover:border-amber hover:text-amber"
          >
            <span className="label">Read the case study</span>
            <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
              <path
                d="M1 6h10M7 2l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="square"
              />
            </svg>
          </Link>
        </div>

        {/* ------------------------------------------------------ the visual */}
        <motion.div
          style={{ y: visualY }}
          className={cn(
            "lg:col-span-6",
            flip ? "lg:order-1 lg:col-start-1" : "lg:order-2 lg:col-start-7",
          )}
        >
          <Link
            href={`/work/${project.slug}`}
            data-cursor="View case study"
            aria-label={`${project.name} — read the case study`}
            className="block transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-[-4px]"
          >
            <ProjectVisual diagram={project.diagram} />
          </Link>
        </motion.div>
      </div>
    </article>
  );
}

export function Work() {
  return (
    <section
      id="work"
      aria-label="Selected work"
      className="relative py-[clamp(5rem,12vh,9rem)] gut"
    >
      <SectionHeader
        index="04"
        label="Selected Work"
        title={["Three systems,", "built end to end."]}
        lede="Each one is a product with a real architecture behind it. The diagrams are the systems — not mockups."
        align="between"
        className="mb-[clamp(3rem,8vh,5rem)]"
      />

      <div>
        {projects.map((project, i) => (
          <ProjectRow key={project.slug} project={project} i={i} />
        ))}
      </div>

      {/* Three here, the rest one click away. The homepage argues for the
          strongest work; the index lists everything. */}
      <div
        data-rise="up"
        className="flex flex-wrap items-baseline justify-between gap-6 border-t border-line pt-10"
      >
        <p className="max-w-[36ch] text-[1rem] leading-[1.6] text-ash">
          There are more — smaller builds, and the repositories behind them.
        </p>
        <Link
          href="/work"
          data-cursor="Explore"
          className="label border-b border-line-strong pb-1.5 text-bone transition-colors hover:border-amber hover:text-amber"
        >
          Show all projects →
        </Link>
      </div>
    </section>
  );
}
