"use client";

import Link from "next/link";

import { MaskText } from "@/components/ui/MaskText";
import { riseDelay } from "@/components/ui/Reveal";
import { projects, sideProjects, type SideProject } from "@/data/projects";
import { site, socials } from "@/data/site";

/** An arrow that leaves the page — repositories and deployments are off-site. */
function External() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 shrink-0" fill="none" aria-hidden="true">
      <path
        d="M3 9 9 3M9 3H4.5M9 3v4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

function RepoRow({ project, i }: { project: SideProject; i: number }) {
  return (
    <li
      data-rise="up"
      style={riseDelay(i % 3)}
      className="group grid gap-x-10 gap-y-5 border-t border-line py-9 lg:grid-cols-12"
    >
      <div className="flex flex-col gap-2 lg:col-span-3">
        <span className="label text-amber">{project.kicker}</span>
        <h3 className="display text-[clamp(1.375rem,2.2vw,1.75rem)] text-bone">
          {project.name}
        </h3>
        <span className="label text-dim">{project.status}</span>
      </div>

      <div className="flex flex-col gap-5 lg:col-span-6">
        <p className="max-w-[58ch] text-[1rem] leading-[1.65] text-ash">
          {project.summary}
        </p>
        {project.note ? (
          <p className="label text-faint">{project.note}</p>
        ) : null}
        <ul className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="label rounded-full border border-line px-2.5 py-1.5 text-dim"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-start gap-3 lg:col-span-3 lg:items-end">
        {project.live ? (
          <a
            href={project.live}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="Open"
            className="label flex items-center gap-2 border-b border-line-strong pb-1.5 text-bone transition-colors hover:border-amber hover:text-amber"
          >
            Live <External />
          </a>
        ) : null}
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer noopener"
          data-cursor="Open"
          className="label flex items-center gap-2 border-b border-transparent pb-1.5 text-ash transition-colors hover:border-amber hover:text-amber"
        >
          Source <External />
        </a>
      </div>
    </li>
  );
}

/**
 * Everything, in one list.
 *
 * Two registers on purpose. The case studies are argued — a problem, a
 * system, a diagram built for that architecture. The repositories are
 * listed, described from what their own READMEs say and linked. Flattening
 * the two into one uniform grid would either inflate the second group or
 * flatten the first.
 */
export function AllWork() {
  return (
    <div className="min-h-[100svh] pb-[clamp(4rem,10vh,7rem)] pt-[clamp(6rem,14vh,9rem)]">
      <header className="gut">
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
          <span className="label">Back</span>
        </Link>

        <div className="mt-[clamp(2.5rem,7vh,5rem)]">
          <span className="label text-amber">Everything</span>
          <h1 className="mt-5">
            <MaskText
              lines={["All", "projects."]}
              immediate
              className="display-serif text-[clamp(3.25rem,11vw,10rem)] text-bone"
            />
          </h1>
          <p className="mt-7 max-w-[46ch] text-lead leading-[1.5] text-ash">
            Three written up as case studies, with the architecture drawn out.
            The rest are repositories — described from their own READMEs and
            linked, nothing more claimed than they claim.
          </p>
        </div>
      </header>

      {/* ------------------------------------------------- the case studies */}
      <section className="mt-[clamp(3rem,8vh,6rem)] gut" aria-label="Case studies">
        <div className="flex items-baseline justify-between gap-6 border-b border-line-strong pb-4">
          <h2 className="label text-bone">Case studies</h2>
          <span className="label text-faint">{projects.length}</span>
        </div>

        <ul>
          {projects.map((project, i) => (
            <li
              key={project.slug}
              data-rise="up"
              style={riseDelay(i % 3)}
              className="group border-t border-line py-9"
            >
              <Link
                href={`/work/${project.slug}`}
                data-cursor="View case study"
                className="grid gap-x-10 gap-y-5 lg:grid-cols-12"
              >
                <div className="flex flex-col gap-2 lg:col-span-3">
                  <span className="label text-amber">{project.kicker}</span>
                  <h3 className="display text-[clamp(1.375rem,2.2vw,1.75rem)] text-bone transition-colors duration-500 group-hover:text-amber">
                    {project.name}
                  </h3>
                  <span className="label text-dim">
                    {project.period} · {project.status}
                  </span>
                </div>

                <div className="flex flex-col gap-5 lg:col-span-6">
                  <p className="max-w-[58ch] text-[1rem] leading-[1.65] text-ash">
                    {project.tagline}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {project.metrics.slice(0, 3).map((m) => (
                      <li
                        key={m.label}
                        className="label rounded-full border border-line px-2.5 py-1.5 text-dim"
                      >
                        <span className="text-bone">{m.value}</span> {m.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex lg:col-span-3 lg:justify-end">
                  <span className="label border-b border-line-strong pb-1.5 text-bone transition-colors group-hover:border-amber group-hover:text-amber">
                    Read it →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------ the rest */}
      <section className="mt-[clamp(3.5rem,9vh,6rem)] gut" aria-label="Repositories">
        <div className="flex items-baseline justify-between gap-6 border-b border-line-strong pb-4">
          <h2 className="label text-bone">Repositories</h2>
          <span className="label text-faint">{sideProjects.length}</span>
        </div>

        <ul>
          {sideProjects.map((project, i) => (
            <RepoRow key={project.repo} project={project} i={i} />
          ))}
        </ul>
      </section>

      <div className="mt-[clamp(4rem,10vh,7rem)] border-t border-line pt-10 gut">
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <p className="max-w-[34ch] font-serif text-[clamp(1.125rem,2vw,1.625rem)] italic leading-[1.4] text-ash">
            The rest of what I am working on is on GitHub.
          </p>
          <a
            href={socials[0].href}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="Open"
            className="label flex items-center gap-2 border-b border-line-strong pb-1.5 text-bone transition-colors hover:border-amber hover:text-amber"
          >
            GitHub <External />
          </a>
        </div>
        <p className="label mt-10 text-faint">
          {site.name} — {site.role}
        </p>
      </div>
    </div>
  );
}
