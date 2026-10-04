"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Counter } from "@/components/ui/Counter";
import { MaskText } from "@/components/ui/MaskText";
import { Metric } from "@/components/ui/Metric";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { riseDelay } from "@/components/ui/Reveal";
import type { Project } from "@/data/projects";
import { EASE_OUT_EXPO } from "@/lib/animations/variants";
import { PipelineFlow } from "./PipelineFlow";
import { ProjectVisual } from "./ProjectVisual";

/** The repeating chapter heading inside a case study. */
function Chapter({
  index,
  title,
  children,
  wide = false,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="border-t border-line py-[clamp(3rem,8vh,6rem)]">
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
        <header className="lg:col-span-3">
          <div className="sticky top-32 flex items-baseline gap-4 lg:flex-col lg:items-start lg:gap-5">
            <span className="label text-amber">{index}</span>
            <h2 className="display text-[clamp(1.5rem,2.6vw,2.25rem)] text-bone">
              {title}
            </h2>
          </div>
        </header>
        <div className={wide ? "lg:col-span-9" : "lg:col-span-8 lg:col-start-5"}>
          {children}
        </div>
      </div>
    </section>
  );
}

function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-6">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          data-rise="up"
          style={riseDelay(i)}
          className="max-w-[62ch] text-[clamp(1.0625rem,1.25vw,1.1875rem)] leading-[1.7] text-ash"
        >
          {p}
        </p>
      ))}
    </div>
  );
}

export function CaseStudy({
  project,
  next,
}: {
  project: Project;
  next: Project;
}) {
  return (
    <article className="pt-[clamp(6rem,14vh,9rem)]">
      {/* ===================================================== title block */}
      <header className="gut">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <Link
            href="/#work"
            data-cursor-expand
            className="group inline-flex items-center gap-3 text-ash transition-colors hover:text-amber"
          >
            <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
              <path
                d="M11 6H1M5 2L1 6l4 4"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="square"
              />
            </svg>
            <span className="label">All work</span>
          </Link>
          <span className="label text-dim">
            Project {project.index}
            <span className="text-faint"> / 03</span>
          </span>
        </motion.div>

        <div className="mt-[clamp(2.5rem,7vh,5rem)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            <span className="label text-amber">{project.kicker}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
            <span className="label text-dim">{project.period}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
            <span className="label text-dim">{project.status}</span>
          </motion.div>

          <h1 className="mt-6">
            <MaskText
              lines={[project.name]}
              immediate
              className="display text-d2 text-bone"
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mt-7 max-w-[38ch] font-serif text-[clamp(1.25rem,2.2vw,1.875rem)] italic leading-[1.35] text-amber"
          >
            {project.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            className="mt-8 max-w-[62ch] text-lead leading-[1.65] text-ash"
          >
            {project.summary}
          </motion.p>
        </div>

        {/* Headline metrics */}
        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="mt-[clamp(3rem,8vh,5rem)] grid gap-x-8 gap-y-8 border-y border-line py-10 sm:grid-cols-3"
        >
          {project.metrics.map((m) => (
            <Metric key={m.label} {...m} />
          ))}
        </motion.dl>

        {/* The signature visual */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.65 }}
          className="mt-[clamp(3rem,8vh,5rem)]"
        >
          <ProjectVisual diagram={project.diagram} />
        </motion.div>
      </header>

      {/* ===================================================== the chapters */}
      <div className="mt-[clamp(3rem,8vh,6rem)] gut">
        <Chapter index="01" title="The problem">
          <Prose paragraphs={project.problem} />
        </Chapter>

        <Chapter index="02" title="The system">
          <Prose paragraphs={project.system} />
        </Chapter>

        <Chapter index="03" title="The architecture" wide>
          <p className="mb-10 max-w-[56ch] text-[1.0625rem] leading-[1.7] text-ash">
            Every stage below is a decision. Step through them to see what each
            one is responsible for and why it sits where it does.
          </p>
          <PipelineFlow nodes={project.pipeline} />
        </Chapter>

        <Chapter index="04" title="The build" wide>
          <ul className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
            {project.build.map((note, i) => (
              <li
                key={note.title}
                data-rise="up"
                style={riseDelay(i % 2)}
                className="space-y-4 border-t border-line pt-6"
              >
                <div className="flex items-baseline gap-4">
                  <span className="label text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display text-[clamp(1.25rem,2vw,1.625rem)] text-bone">
                    {note.title}
                  </h3>
                </div>
                <p className="max-w-[50ch] text-[1rem] leading-[1.7] text-ash">
                  {note.body}
                </p>
              </li>
            ))}
          </ul>
        </Chapter>

        <Chapter index="05" title="The result">
          <ul className="space-y-6">
            {project.results.map((r, i) => (
              <li
                key={i}
                data-rise="up"
                style={riseDelay(i)}
                className="flex gap-5 border-t border-line pt-5"
              >
                <span className="label shrink-0 pt-1 text-amber">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-[58ch] text-[1.0625rem] leading-[1.7] text-ash">
                  {r}
                </p>
              </li>
            ))}
          </ul>

          {/* The engineering ledger — scannable claims */}
          <div className="mt-12 rounded-[4px] border border-line bg-ink/50 p-7">
            <span className="label block text-amber">Engineering ledger</span>
            <ul className="mt-5 space-y-3">
              {project.engineering.map((e, i) => (
                <li
                  key={e}
                  data-rise="side"
                  style={riseDelay(i)}
                  className="flex items-baseline gap-3 text-[0.9375rem] leading-[1.6] text-ash"
                >
                  <span aria-hidden="true" className="mt-[0.55em] size-1 shrink-0 bg-amber" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </Chapter>

        <Chapter index="06" title="Technology" wide>
          <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {project.stack.map((group, i) => (
              <div
                key={group.group}
                data-rise="up"
                style={riseDelay(i)}
                className="border-t border-line pt-5"
              >
                <dt className="label text-amber">{group.group}</dt>
                <dd>
                  <ul className="mt-4 space-y-2.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="font-sans text-[0.9375rem] leading-[1.4] text-ash"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </Chapter>
      </div>

      {/* ==================================================== next project */}
      <section className="border-t border-line">
        <Link
          href={`/work/${next.slug}`}
          data-cursor="Next case study"
          className="group block py-[clamp(4rem,10vh,7rem)] gut"
        >
          <span className="label text-dim">Next project</span>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-6">
            <div className="flex items-baseline gap-6">
              <span className="display text-[clamp(2rem,4vw,3.5rem)] text-faint transition-colors duration-500 group-hover:text-amber">
                {next.index}
              </span>
              <span className="display text-[clamp(2rem,5vw,4.25rem)] text-bone transition-colors duration-500 group-hover:text-amber">
                {next.name}
              </span>
            </div>
            <span className="label text-amber">{next.kicker}</span>
          </div>
        </Link>
      </section>

      {/* Back to the homepage flow */}
      <div className="border-t border-line py-10 gut">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Counter
            value={project.metrics[0].value}
            className="label text-faint"
          />
          <ArrowLink href="/#contact" variant="bare">
            Start a conversation
          </ArrowLink>
        </div>
      </div>
    </article>
  );
}
