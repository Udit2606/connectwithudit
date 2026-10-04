"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { riseDelay } from "@/components/ui/Reveal";
import { story } from "@/data/story";

function Chapter({ chapter }: { chapter: (typeof story)[number] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // The chapter number drifts against the scroll — a slow parallax anchor.
  const y = useTransform(scrollYProgress, [0, 1], ["28%", "-28%"]);

  return (
    <article
      ref={ref}
      className="relative grid gap-y-6 border-t border-line py-[clamp(2.5rem,6vh,4.5rem)] md:grid-cols-12 md:gap-x-8"
    >
      {/* Index + marker */}
      <div className="md:col-span-3 lg:col-span-2">
        <motion.div
          style={{ y }}
          className="flex items-baseline gap-4 md:flex-col md:gap-5"
        >
          <span className="display text-[clamp(2.25rem,4vw,3.75rem)] text-faint">
            {chapter.index}
          </span>
          <span className="label max-w-[18ch] leading-[1.6] text-dim">
            {chapter.marker}
          </span>
        </motion.div>
      </div>

      {/* Title + lede */}
      <div className="md:col-span-4 lg:col-span-4">
        <h3
          data-rise="up"
          className="display text-d4 text-bone"
        >
          {chapter.title}
        </h3>
        <p
          data-rise="up"
          style={riseDelay(1)}
          className="mt-4 max-w-[30ch] font-serif text-[clamp(1.125rem,1.7vw,1.5rem)] italic leading-[1.4] text-amber"
        >
          {chapter.lede}
        </p>
      </div>

      {/* Body — one paragraph, on purpose */}
      <div className="md:col-span-5 lg:col-span-5 lg:col-start-8">
        <p
          data-rise="up"
          style={riseDelay(0, 150)}
          className="max-w-[42ch] text-[1.0625rem] leading-[1.6] text-ash"
        >
          {chapter.body}
        </p>
      </div>
    </article>
  );
}

export function Story() {
  return (
    <section
      id="story"
      aria-label="Story"
      className="relative py-[clamp(5rem,12vh,9rem)] gut"
    >
      <SectionHeader
        index="03"
        label="Story"
        title={["Five chapters,", "one direction."]}
        lede="Saharanpur to Vellore, curiosity to systems. The short version of how I got to building the things below."
        align="between"
        className="mb-[clamp(3rem,8vh,6rem)]"
      />

      <div>
        {story.map((chapter) => (
          <Chapter key={chapter.index} chapter={chapter} />
        ))}
      </div>
    </section>
  );
}
