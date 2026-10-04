"use client";

import { Counter } from "@/components/ui/Counter";
import { riseDelay } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { certification, education, humanIntro, roles } from "@/data/human";

/**
 * The human layer. Framed as responsibility rather than trophies — each entry
 * says what the role asked of him, not what it looked like on a certificate.
 */
export function Human() {
  return (
    <section
      id="human"
      aria-label="Beyond engineering"
      className="relative py-[clamp(5rem,12vh,9rem)] gut"
    >
      <SectionHeader
        index="07"
        label={humanIntro.kicker}
        title={["Engineering is a team sport", "before it's a technical one."]}
        lede={humanIntro.note}
        align="between"
        className="mb-[clamp(3rem,8vh,5rem)]"
      />

      <div className="grid gap-x-10 gap-y-14 lg:grid-cols-12">
        {/* ----------------------------------------------------------- roles */}
        <ul className="lg:col-span-7">
          {roles.map((role, i) => (
            <li
              key={role.index}
              data-rise="up"
              style={riseDelay(i)}
              className="group grid gap-x-6 gap-y-3 border-t border-line py-7 sm:grid-cols-[auto_1fr]"
            >
              <div className="flex items-baseline gap-4 sm:w-24 sm:flex-col sm:gap-2">
                <span className="label text-faint">{role.index}</span>
                <span className="label text-dim">{role.period}</span>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="display text-[clamp(1.375rem,2.3vw,1.875rem)] text-bone">
                    {role.title}
                  </h3>
                  {role.stat ? (
                    <span className="label shrink-0 text-amber">
                      {role.stat.value}
                    </span>
                  ) : null}
                </div>
                <p className="label text-ash">{role.org}</p>
                <p className="max-w-[52ch] text-[1rem] leading-[1.65] text-ash">
                  {role.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* ------------------------------------------------------- education */}
        <aside
          data-rise="up"
          style={riseDelay(2)}
          className="space-y-10 lg:col-span-4 lg:col-start-9"
        >
          <div className="space-y-6">
            <span className="label block text-amber">Education</span>
            <ul className="space-y-6">
              {education.map((ed) => (
                <li key={ed.institution} className="space-y-2 border-t border-line pt-5">
                  <h3 className="font-sans text-[1.0625rem] font-medium leading-[1.35] text-bone">
                    {ed.institution}
                  </h3>
                  <p className="text-[0.9375rem] leading-[1.5] text-ash">
                    {ed.qualification}
                  </p>
                  <p className="label text-dim">
                    {ed.period} · {ed.location}
                  </p>
                  {ed.detail ? (
                    <p className="label pt-1 text-amber">{ed.detail}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 border-t border-line pt-5">
            <span className="label block text-amber">Certification</span>
            <p className="font-sans text-[1rem] leading-[1.4] text-bone">
              {certification.title}
            </p>
            <p className="label text-dim">{certification.detail}</p>
          </div>

          {/* The one number worth pulling out */}
          <div className="rounded-[4px] border border-line bg-ink/50 p-6">
            <Counter
              value="8.51"
              className="display block text-[clamp(2.25rem,4vw,3rem)] tabular-nums text-bone"
            />
            <p className="label mt-2 text-dim">CGPA / 10 · VIT Vellore</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
