"use client";

import { MaskText } from "@/components/ui/MaskText";
import { Marquee } from "@/components/ui/Marquee";
import { riseDelay } from "@/components/ui/Reveal";
import { experiments, labIntro } from "@/data/experiments";

/**
 * The informal section. Looser grid, bigger gaps, lighter voice — it should
 * feel like a different room in the same building.
 */
export function Lab() {
  return (
    <section
      id="experiments"
      aria-label="Lab"
      className="relative overflow-hidden py-[clamp(5rem,12vh,9rem)]"
    >
      {/* A full-bleed marquee marks the shift in register */}
      <div className="border-y border-line py-5">
        {/* "Lab" and "Experiments" used to lead this list and both were
            saying what the section already is. What is left are the three
            that actually describe the work. */}
        <Marquee
          items={["Side quests", "Half-built ideas", "Things that worked"]}
          duration={38}
          className="display text-[clamp(1.75rem,4vw,3.25rem)] text-faint"
        />
      </div>

      <div className="gut">
        <div className="flex flex-col gap-8 py-[clamp(3rem,8vh,5rem)] lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-baseline gap-4">
            <span className="label text-amber">07</span>
            <MaskText
              as="h2"
              lines={["Things I built because", "I wanted to know if I could."]}
              className="display max-w-[24ch] text-d3 text-bone"
            />
          </div>
          <p
            data-rise="up"
            style={riseDelay(2)}
            className="max-w-[40ch] text-lead leading-[1.55] text-ash lg:text-right"
          >
            {labIntro.note}
          </p>
        </div>

        {/* Deliberately uneven: a masonry-ish rhythm, not a tidy grid */}
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {experiments.map((exp, i) => (
            <li
              key={exp.index}
              data-rise="up"
              className="group relative flex flex-col gap-4 border-t border-line pt-6"
              style={{
                ...riseDelay(i % 3),
                // Nudge the middle column down for an uneven, less templated grid.
                marginTop: i % 3 === 1 ? "var(--lab-offset)" : undefined,
              }}
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-px w-0 bg-amber transition-[width] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:w-full"
              />

              <div className="flex items-baseline justify-between gap-4">
                <span className="label text-faint">{exp.index}</span>
                <span className="label text-amber">{exp.kind}</span>
              </div>

              <h3 className="display text-[clamp(1.375rem,2.1vw,1.75rem)] text-bone">
                {exp.title}
              </h3>

              <p className="text-[0.9375rem] leading-[1.65] text-ash">{exp.body}</p>

              <ul className="mt-auto flex flex-wrap gap-x-2 gap-y-2 pt-2">
                {exp.tags.map((tag) => (
                  <li
                    key={tag}
                    className="label rounded-full border border-line px-2.5 py-1.5 text-dim"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
