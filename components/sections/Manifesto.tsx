"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { MaskText } from "@/components/ui/MaskText";
import { riseDelay } from "@/components/ui/Reveal";
import { manifesto } from "@/data/story";

/**
 * The editorial pivot. Typography is the only subject.
 *
 * "Systems" and "Products" drift in opposite directions against the scroll.
 * Both sit inside the page gutter and are capped below the hero's display
 * size, so the drift never pushes a word off the edge.
 */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const fromX = useTransform(scrollYProgress, [0, 1], ["3%", "-5%"]);
  const toX = useTransform(scrollYProgress, [0, 1], ["-4%", "6%"]);

  return (
    <section
      ref={ref}
      id="manifesto"
      aria-label="Manifesto"
      className="relative overflow-hidden py-[clamp(6rem,15vh,11rem)]"
    >
      <div className="gut">
        {/* The statement */}
        <div className="mx-auto max-w-[68rem]">
          <MaskText
            as="p"
            lines={["I don't just build", "interfaces."]}
            className="display text-d2"
            lineClassName="[&:first-child]:text-dim text-bone"
          />
          <div className="h-[clamp(1.5rem,5vh,3.5rem)]" />
          <MaskText
            as="p"
            lines={["I build the systems", "behind them."]}
            className="display pl-[6%] text-d2 text-bone md:pl-[16%]"
          />
        </div>

        {/* Supporting body — deliberately small against the display type */}
        <p
          data-rise="up"
          className="mx-auto mt-[clamp(2.5rem,7vh,5rem)] max-w-[52ch] text-lead leading-[1.6] text-ash"
        >
          {manifesto.body}
        </p>
      </div>

      {/* FROM / TO — the concept, stated once, at scale */}
      <div className="mt-[clamp(3.5rem,10vh,7rem)] gut">
        <div className="space-y-[clamp(0.5rem,2vh,1.25rem)]">
          <motion.div
            style={{ x: fromX }}
            className="flex items-baseline gap-4 sm:gap-6"
          >
            <span className="label shrink-0 translate-y-[-0.6em] text-dim">
              From
            </span>
            <span className="display text-d2 text-faint">{manifesto.from}</span>
          </motion.div>

          <span aria-hidden="true" data-rise="rule" className="u-rule block" />

          <motion.div
            style={{ x: toX }}
            className="flex items-baseline justify-end gap-4 sm:gap-6"
          >
            <span className="display text-d2 text-bone">{manifesto.to}</span>
            <span className="label shrink-0 translate-y-[-0.6em] text-amber">
              To
            </span>
          </motion.div>
        </div>
      </div>

      {/* The arc — idea → impact */}
      <ol className="mt-[clamp(3rem,8vh,5.5rem)] flex flex-wrap items-center gap-x-5 gap-y-3 gut">
        {manifesto.arc.map((step, i) => (
          <li
            key={step}
            data-rise="up"
            style={riseDelay(i)}
            className="flex items-center gap-5"
          >
            <span className="label text-ash">
              <span className="text-amber">
                {String(i + 1).padStart(2, "0")}
              </span>{" "}
              {step}
            </span>
            {i < manifesto.arc.length - 1 ? (
              <span
                aria-hidden="true"
                className="h-px w-8 bg-line-strong sm:w-12"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
