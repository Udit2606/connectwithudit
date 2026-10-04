"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { useIntro } from "@/components/chrome/Intro";
import { HeroVisual } from "@/components/three/HeroVisual";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { site } from "@/data/site";
import { EASE_OUT_EXPO } from "@/lib/animations/variants";

/**
 * The hero: wordmark on the left, the diorama clear of it on the right.
 *
 * An earlier version split the wordmark across two layers so the 3D object
 * passed between "Udit" and "Mittal". It was a nice trick and the wrong call:
 * the surname spent most of its time half-occluded by a monitor. The name is
 * the one element that has to be unmistakable, so it gets its own column and
 * the visual gets the other.
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

      {/* The diorama, behind the content and offset to the right */}
      <div className="absolute inset-0 z-0">
        <HeroVisual progress={progress} ready={done} />
      </div>

      {/* Content. Constrained to the left so it never sits over the visual. */}
      <div className="relative z-20 flex min-h-[100svh] flex-col justify-between gap-10 pb-[clamp(1.5rem,4vh,2.5rem)] pt-[clamp(6rem,14vh,9.5rem)] gut">
        <div className="flex flex-col gap-[clamp(1.75rem,4vh,2.75rem)]">
          {/* Metadata rail */}
          <motion.div
            {...fade(0.22)}
            className="flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            {site.meta.education.map((item, i) => (
              <span key={item} className="flex items-center gap-4">
                <span className="label text-dim">{item}</span>
                {i < site.meta.education.length - 1 ? (
                  <span aria-hidden="true" className="h-px w-5 bg-line-strong" />
                ) : null}
              </span>
            ))}
          </motion.div>

          {/* The wordmark — one layer, fully legible */}
          <div className="relative w-fit lg:max-w-[46%]">
            {/*
              The translucency sits behind the name and nowhere else.
              An earlier version was a column-wide gradient, which also
              veiled the diorama — so this is masked down to a soft haze the
              size of the two lines, feathering out well before it reaches
              the scene. The mask is what keeps it from reading as a panel:
              a hard-edged blurred rectangle behind type looks like a bug.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -z-10 backdrop-blur-[7px]"
              style={{
                inset: "-14% -11%",
                background:
                  "radial-gradient(68% 58% at 38% 50%, color-mix(in srgb, var(--color-void) 78%, transparent) 0%, transparent 100%)",
                maskImage:
                  "radial-gradient(68% 58% at 38% 50%, #000 38%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(68% 58% at 38% 50%, #000 38%, transparent 100%)",
              }}
            />
            <h1 className="display-serif relative select-none text-[clamp(3rem,10vw,10.5rem)] text-bone">
              <span className="u-sr">
                {site.name} — {site.role}
              </span>
              {line("Udit", 0.04)}
              {line("Mittal", 0.13)}
            </h1>
          </div>
        </div>

        {/* Statement + actions */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div {...fade(0.3)} className="space-y-7">
            <p className="max-w-[32ch] text-lead leading-[1.45] text-bone">
              Software engineer building{" "}
              <em className="whitespace-nowrap font-serif text-[1.06em] italic text-amber">
                AI-powered products
              </em>{" "}
              and cloud-native systems.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <ArrowLink href="#work" variant="filled" cursorLabel="Explore">
                Explore work
              </ArrowLink>
              <ArrowLink href="#contact" variant="outline">
                Let&rsquo;s connect
              </ArrowLink>
            </div>
          </motion.div>

          <motion.div
            {...fade(0.42)}
            className="flex items-end justify-between gap-8 lg:flex-col lg:items-end lg:gap-6"
          >
            <div className="flex items-center gap-2.5">
              {site.positioning.slice(0, 3).map((word, i) => (
                <span key={word} className="flex items-center gap-2.5">
                  <span className="label text-ash">{word}</span>
                  {i < 2 ? (
                    <span aria-hidden="true" className="text-amber/60">
                      /
                    </span>
                  ) : null}
                </span>
              ))}
            </div>

            <a
              href="#manifesto"
              data-cursor-expand
              className="group flex items-center gap-3 text-dim transition-colors hover:text-bone"
            >
              <span className="label">Scroll</span>
              <span
                aria-hidden="true"
                className="relative h-8 w-px overflow-hidden bg-line-strong"
              >
                <span className="absolute inset-x-0 top-0 h-3 animate-[scroll-cue_2s_var(--ease-swift)_infinite] bg-amber" />
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Dissolve into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-44 bg-gradient-to-t from-void via-void/70 to-transparent"
      />
    </section>
  );
}
