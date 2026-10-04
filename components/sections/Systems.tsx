"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { riseDelay } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { foundations, layers } from "@/data/technologies";
import { EASE_OUT_EXPO } from "@/lib/animations/variants";
import { cn } from "@/lib/utils/cn";

/**
 * The same five strata as the sculpture in the hero, now labelled.
 *
 * This is the section that connects a technology to the place it was actually
 * used — every entry carries its real provenance, so the stack reads as a
 * record rather than a word cloud.
 */
export function Systems() {
  /* All closed on arrival. Services used to be open by default, which made
     the section land as one expanded panel with four collapsed rows under
     it — and the lede asks you to open one, so having one already open
     answered the invitation before it was made. "" is the closed state the
     toggle already uses. */
  const [open, setOpen] = useState("");

  return (
    <section
      id="systems"
      aria-label="Under the surface"
      className="relative py-[clamp(5rem,12vh,9rem)] gut"
    >
      <SectionHeader
        index="05"
        label="Under the Surface"
        title={["The stack,", "as it's actually built."]}
        lede="Five layers. Open one to see what runs there, and where I've actually shipped it."
        align="between"
        className="mb-[clamp(3rem,8vh,5rem)]"
      />

      <div className="grid gap-10 lg:grid-cols-12">
        {/* ------------------------------------------------------- the strata */}
        <div className="lg:col-span-8">
          <ul className="border-t border-line">
            {layers.map((layer, i) => {
              const isOpen = open === layer.id;
              const panelId = `layer-panel-${layer.id}`;
              return (
                <li
                  key={layer.id}
                  data-rise="up"
                  style={riseDelay(i)}
                  className="border-b border-line"
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? "" : layer.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      data-cursor-expand
                      className="group flex w-full items-center gap-5 py-6 text-left"
                    >
                      <span
                        className={cn(
                          "label w-8 shrink-0 transition-colors duration-500",
                          isOpen ? "text-amber" : "text-faint",
                        )}
                      >
                        {layer.index}
                      </span>

                      {/* The stratum itself — a plate, seen edge-on */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "hidden h-7 w-16 shrink-0 border transition-all duration-700 sm:block",
                          isOpen
                            ? "border-amber/70 bg-amber/10"
                            : "border-line-strong bg-bone/[0.02] group-hover:border-ash/40",
                        )}
                        style={{
                          transform: `perspective(300px) rotateX(58deg) translateY(${isOpen ? -2 : 0}px)`,
                          boxShadow: isOpen
                            ? "0 10px 26px -14px color-mix(in srgb, var(--color-amber) 60%, transparent)"
                            : undefined,
                        }}
                      />

                      <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                        <span
                          className={cn(
                            "display text-[clamp(1.375rem,2.6vw,2.125rem)] transition-colors duration-500",
                            isOpen
                              ? "text-bone"
                              : "text-ash group-hover:text-bone",
                          )}
                        >
                          {layer.name}
                        </span>
                        <span className="label text-dim">{layer.role}</span>
                      </span>

                      <span
                        aria-hidden="true"
                        className={cn(
                          "relative size-3 shrink-0 transition-colors duration-500",
                          isOpen ? "text-amber" : "text-dim",
                        )}
                      >
                        <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                        <span
                          className={cn(
                            "absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-500",
                            isOpen ? "scale-y-0" : "scale-y-100",
                          )}
                        />
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={panelId}
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-6 pb-8 sm:pl-[7.25rem]">
                          <p className="max-w-[58ch] text-[1.0625rem] leading-[1.65] text-ash">
                            {layer.note}
                          </p>

                          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                            {layer.tech.map((t) => (
                              <div
                                key={t.name}
                                className="border-t border-line pt-3"
                              >
                                <dt className="font-sans text-[0.9375rem] font-medium text-bone">
                                  {t.name}
                                </dt>
                                <dd className="label mt-1.5 leading-[1.7] text-dim">
                                  <span className="text-faint">Used in </span>
                                  {t.usedIn.join(" · ")}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ---------------------------------------------------- foundations */}
        <aside data-rise="up" style={riseDelay(3)} className="lg:col-span-4">
          <div className="sticky top-32 space-y-7 rounded-[4px] border border-line bg-ink/50 p-7">
            <div className="space-y-3">
              <span className="label text-amber">{foundations.title}</span>
              <p className="text-[0.9375rem] leading-[1.6] text-ash">
                {foundations.note}
              </p>
            </div>

            {foundations.groups.map((group) => (
              <div
                key={group.label}
                className="space-y-3 border-t border-line pt-5"
              >
                <span className="label text-dim">{group.label}</span>
                <ul className="flex flex-wrap gap-x-2 gap-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="label rounded-full border border-line px-2.5 py-1.5 text-ash"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
