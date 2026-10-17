"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { useIntro } from "@/components/chrome/Intro";
import { HeroVisual } from "@/components/three/HeroVisual";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { site } from "@/data/site";
import { EASE_OUT_EXPO } from "@/lib/animations/variants";

/**
 * The hero: the name centred on the first screen, with the diorama faded
 * back behind it so the name is always the first thing read.
 */
export function Hero() {
  const { done } = useIntro();
  const sectionRef = useRef<HTMLElement>(null);
  /** 0 → 1 across the hero's own height; read by the 3D scene each frame. */
  const progress = useRef(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      const h = el.offsetHeight || window.innerHeight;
      progress.current = Math.min(Math.max(window.scrollY / h, 0), 1);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
      ref={sectionRef}
      id="hero"
      aria-label="Introduction"
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      <div aria-hidden="true" className="u-grid-frame opacity-40" />

      {/* The diorama, below the text and partly faded */}
      <div className="absolute inset-0 z-0 opacity-60 saturate-[0.8]">
        <HeroVisual progress={progress} ready={done} />
      </div>

      {/* A matte finish over the diorama (see .hero-matte) */}
      <div
        aria-hidden="true"
        className="hero-matte pointer-events-none absolute inset-0 z-10"
      />

      {/* Content, centred and held high, so the screen on the desk below
          ("What if I could build it?") stays in view. */}
      <div className="relative z-20 flex min-h-[100svh] flex-col items-center justify-start gap-[clamp(1rem,2.5vh,1.75rem)] pb-[clamp(4rem,10vh,7rem)] pt-[clamp(6.5rem,13vh,8.5rem)] text-center gut">
        <h1 className="display-serif relative select-none whitespace-nowrap text-[clamp(2.25rem,7.5vw,7.5rem)] uppercase tracking-[0.06em] text-bone">
          <span className="u-sr">
            {site.name} — {site.role}
          </span>
          {line("Udit Mittal", 0.04)}
        </h1>

        {/* Statement + actions */}
        <motion.div {...fade(0.3)} className="flex flex-col items-center gap-5">
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
