"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { useIntro } from "@/components/chrome/Intro";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { site } from "@/data/site";
import { EASE_OUT_EXPO } from "@/lib/animations/variants";

/**
 * The paper sky: a soft blue wave across the lower part of the screen, with
 * a deeper fold running through it and a paler dip where the statement sits.
 *
 * Both skies are drawn on a 1440×900 stage and cover the hero the way a
 * background image would (`slice`), so a phone shows the middle of the wave
 * rather than a squeezed copy of all of it.
 */
function LightSky() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className="hero-sky hero-sky--light"
    >
      <defs>
        <filter
          id="sky-blur-light"
          filterUnits="userSpaceOnUse"
          x="-200"
          y="-100"
          width="1840"
          height="1200"
        >
          <feGaussianBlur stdDeviation="44" />
        </filter>
        <linearGradient id="sky-body-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#84b9ff" />
          <stop offset="1" stopColor="#8fc1ee" />
        </linearGradient>
        {/* The wave fades out against the left edge, as in the reference. */}
        <linearGradient id="sky-edge-light" x1="0" x2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.1" stopColor="#fff" />
        </linearGradient>
        <radialGradient id="sky-dip-light">
          <stop offset="0" stopColor="#000" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <mask
          id="sky-mask-light"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1440"
          height="900"
        >
          <rect width="1440" height="900" fill="url(#sky-edge-light)" />
          <ellipse
            cx="800"
            cy="640"
            rx="340"
            ry="140"
            fill="url(#sky-dip-light)"
          />
        </mask>
      </defs>
      <g mask="url(#sky-mask-light)">
        <g filter="url(#sky-blur-light)">
          <path
            d="M-80 560 C150 470 330 420 480 440 C620 460 680 600 800 620 C940 640 1060 520 1220 490 C1350 470 1440 470 1520 470 L1520 980 L-80 980 Z"
            fill="url(#sky-body-light)"
          />
          <ellipse cx="500" cy="650" rx="200" ry="110" fill="#62a8ff" />
          <ellipse cx="840" cy="800" rx="280" ry="70" fill="#5ea9ff" />
          <ellipse cx="1250" cy="650" rx="280" ry="110" fill="#6db0ff" />
          <rect x="-80" y="830" width="1600" height="150" fill="#8fc0ec" />
        </g>
      </g>
    </svg>
  );
}

/**
 * The dark sky: blue at the leading edge, then pink and red below. It rises
 * high at the sides and dips in a V through the middle, so the name and the
 * statement stay on the dark.
 */
function DarkSky() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className="hero-sky hero-sky--dark"
    >
      <defs>
        <filter
          id="sky-blur-dark"
          filterUnits="userSpaceOnUse"
          x="-200"
          y="-100"
          width="1840"
          height="1200"
        >
          <feGaussianBlur stdDeviation="52" />
        </filter>
        <linearGradient id="sky-floor-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff2d6f" />
          <stop offset="1" stopColor="#ff5a2e" />
        </linearGradient>
        <radialGradient id="sky-hole-dark">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0.85" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* A clear pocket in the V, behind the statement and the buttons. */}
        <mask
          id="sky-mask-dark"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1440"
          height="900"
        >
          <rect width="1440" height="900" fill="#fff" />
          <ellipse
            cx="720"
            cy="600"
            rx="440"
            ry="200"
            fill="url(#sky-hole-dark)"
          />
        </mask>
      </defs>
      <g mask="url(#sky-mask-dark)" className="hero-sky-pocket">
        <g filter="url(#sky-blur-dark)">
          <path
            d="M-80 340 C260 360 520 560 720 670 C920 560 1180 360 1520 340 L1520 980 L-80 980 Z"
            fill="#4c6dff"
          />
          <path
            d="M-80 480 C280 500 540 680 720 770 C900 680 1160 500 1520 480 L1520 980 L-80 980 Z"
            fill="#ee62d6"
          />
          <ellipse cx="720" cy="760" rx="160" ry="100" fill="#5b7bff" />
          <path
            d="M-80 700 C300 710 560 800 720 840 C880 800 1140 710 1520 700 L1520 980 L-80 980 Z"
            fill="url(#sky-floor-dark)"
          />
        </g>
      </g>
    </svg>
  );
}

/**
 * The hero: the name, set large across the centre of the stage, with one
 * line about the work and two ways in beneath it.
 *
 * Nothing competes with the name. It is the one element on the first screen
 * that has to be unmistakable, so it takes the middle of the screen and the
 * sky rises up behind it.
 */
export function Hero() {
  const { done } = useIntro();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // The sky fades out as the hero scrolls away, so the page below it is the
  // plain substrate again.
  const skyOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

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
      {/* The sky. It rises from below once the page has arrived (see HERO
          SKY in globals.css) and fades as the hero scrolls away. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ opacity: skyOpacity }}
      >
        <div className="hero-sky-rise" data-up={done ? "" : undefined}>
          <LightSky />
          <DarkSky />
        </div>
      </motion.div>
      <div aria-hidden="true" className="u-grid-frame opacity-40" />

      {/* Content, centred on the stage. */}
      <div className="relative z-20 flex min-h-[100svh] flex-col items-center justify-center pb-[clamp(4rem,10vh,7rem)] pt-[clamp(6rem,14vh,9.5rem)] text-center gut">
        {/* The wordmark. The tracking is balanced with an equal indent so the
            letters, not the trailing space after the last one, sit centred. */}
        <h1 className="hero-name select-none pl-[0.02em] font-hero text-[19vw] font-[300] uppercase leading-[0.92] tracking-[0.02em] text-bone sm:text-[clamp(3.5rem,12vw,13rem)]">
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
