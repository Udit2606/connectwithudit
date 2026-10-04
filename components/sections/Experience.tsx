"use client";

import { Counter } from "@/components/ui/Counter";
import { MaskText } from "@/components/ui/MaskText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { riseDelay } from "@/components/ui/Reveal";
import { experience, type Experience as Role } from "@/data/experience";

function Column({
  label,
  items,
  accent = false,
}: {
  label: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <div className="space-y-4">
      <span className="label block text-amber">{label}</span>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            data-rise="up"
            style={riseDelay(i)}
            className="flex gap-3 text-[1rem] leading-[1.6] text-ash"
          >
            <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0 bg-line-strong" />
            <span className={accent ? "text-bone" : undefined}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RoleBlock({ role }: { role: Role }) {
  return (
    <article className="border-t border-line py-[clamp(2.5rem,7vh,5rem)]">
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
        {/* Header */}
        <header className="lg:col-span-4">
          <div className="sticky top-32 space-y-5">
            <div className="flex items-baseline gap-4">
              <span className="display text-[clamp(2.25rem,4vw,3.5rem)] text-faint">
                {role.index}
              </span>
              <span className="label text-dim">{role.period}</span>
            </div>

            <MaskText
              as="h3"
              lines={[role.role]}
              className="display max-w-[16ch] text-d4 text-bone"
            />

            <p className="label text-amber">{role.company}</p>
            <p className="max-w-[34ch] text-[1rem] leading-[1.6] text-ash">
              {role.context}
            </p>

            <ul className="flex flex-wrap gap-x-2 gap-y-2 pt-1">
              {role.stack.map((s) => (
                <li
                  key={s}
                  className="label rounded-full border border-line px-2.5 py-1.5 text-dim"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </header>

        {/* Built / improved / learned */}
        <div className="space-y-10 lg:col-span-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-b border-line pb-8 sm:grid-cols-4">
            {role.metrics.map((m) => (
              <div key={m.label} data-rise="up" className="min-w-0">
                <dd>
                  <Counter
                    value={m.value}
                    className="display block text-[clamp(1.25rem,2.1vw,1.875rem)] tabular-nums text-bone"
                  />
                </dd>
                <dt className="label mt-2 block leading-[1.5] text-dim">
                  {m.label}
                </dt>
              </div>
            ))}
          </dl>

          <div className="grid gap-10 sm:grid-cols-2">
            <Column label="What I built" items={role.built} accent />
            <Column label="What I improved" items={role.improved} />
          </div>

          <blockquote data-rise="up" className="border-l border-amber/50 pl-6">
            <span className="label block text-amber">What I learned</span>
            <p className="mt-4 max-w-[54ch] font-serif text-[clamp(1.125rem,1.8vw,1.5rem)] italic leading-[1.45] text-bone">
              {role.learned}
            </p>
          </blockquote>
        </div>
      </div>
    </article>
  );
}

export function ExperienceSection() {
  return (
    <section
      id="experience"
      aria-label="Experience"
      className="relative py-[clamp(5rem,12vh,9rem)] gut"
    >
      <SectionHeader
        index="06"
        label="Experience"
        title={["Two internships,", "one company, real code."]}
        lede="Both at Core Integra. Written as what I built, what I improved, and what actually changed how I work."
        align="between"
        className="mb-[clamp(3rem,8vh,5rem)]"
      />

      <div>
        {experience.map((role) => (
          <RoleBlock key={role.index} role={role} />
        ))}
      </div>
    </section>
  );
}
