"use client";

import { motion } from "framer-motion";

import { useIntro } from "@/components/chrome/Intro";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { site } from "@/data/site";
import { EASE_OUT_EXPO } from "@/lib/animations/variants";

/**
 * The hero: the name, set large across the centre of the stage, with one
 * line about the work and two ways in beneath it.
 *
 * Nothing competes with the name. It is the one element on the first screen
 * that has to be unmistakable, so it takes the middle of the room and the
 * light falls on it from above.
 */
export function Hero() {
  const { done } = useIntro();

  /**
   * Entrance offsets are kept tight on purpose. These run after the intro
   * clears, and the statement paragraph is the LCP element — every 100ms of
   * delay here is 100ms of Largest Contentful Paint.
   */
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: done ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay },
  });

  const line = (text: string, delay: number) => (
    <span className="block overflow-hidden pb-[0.14em]">
      <motion.span
        className="block will-change-transform"
        initial={{ y: "108%" }}
        animate={done ? { y: "0%" } : { y: "108%" }}
        transition={{ duration: 0.95, ease: EASE_OUT_EXPO, delay }}
      >
        {text}
      </motion.span>
    </span>
  );

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="hero-stage relative isolate min-h-[100svh] overflow-hidden"
    >
      {/* The room the hero sits in — see HERO STAGE in globals.css. */}
      <div aria-hidden="true" className="hero-glow -z-10" />
      <div aria-hidden="true" className="u-grid-frame opacity-40" />

      {/* Content, centred on the stage. */}
      <div className="relative z-20 flex min-h-[100svh] flex-col items-center justify-center pb-[clamp(4rem,10vh,7rem)] pt-[clamp(6rem,14vh,9.5rem)] text-center gut">
        {/* The wordmark. The tracking is balanced with an equal indent so the
            letters, not the trailing space after the last one, sit centred. */}
        <h1 className="select-none pl-[0.02em] font-hero text-[19vw] font-[350] sm:text-[clamp(3.5rem,12vw,13rem)] uppercase leading-[0.92] tracking-[0.02em] text-bone [text-shadow:0_2px_40px_rgb(0_0_0/0.35)]">
          <span className="u-sr">
            {site.name} — {site.role}
          </span>
          {line("Udit", 0.04)}
          {line("Mittal", 0.13)}
        </h1>

        {/* Statement + actions */}
        <motion.div
          {...fade(0.3)}
          className="mt-[clamp(1.75rem,4vh,2.75rem)] flex flex-col items-center gap-7"
        >
          <p className="max-w-[40ch] text-lead leading-[1.45] text-bone">
            Software engineer building{" "}
            <em className="whitespace-nowrap font-serif text-[1.06em] italic text-amber">
              AI-powered products
            </em>{" "}
            and cloud-native systems.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ArrowLink href="#work" variant="filled" cursorLabel="Explore">
              Explore work
            </ArrowLink>
            <ArrowLink href="#contact" variant="outline">
              Let&rsquo;s connect
            </ArrowLink>
          </div>
        </motion.div>
      </div>

      {/* Dissolve into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-44 bg-gradient-to-t from-void via-void/70 to-transparent"
      />
    </section>
  );
}
