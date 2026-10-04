"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { ArrowLink } from "@/components/ui/ArrowLink";
import { MaskText } from "@/components/ui/MaskText";
import { riseDelay } from "@/components/ui/Reveal";
import { site, socials } from "@/data/site";

/**
 * The route arrives: the five waypoints from the hero converge on a single
 * line as the section scrolls in. Narrative closure for the journey, drawn in
 * CSS so the ending costs nothing.
 */
function RouteArrives() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });

  const gap = useTransform(scrollYProgress, [0, 1], [26, 0]);
  const tilt = useTransform(scrollYProgress, [0, 1], [58, 0]);
  const width = useTransform(scrollYProgress, [0, 1], [168, 300]);
  const glow = useTransform(scrollYProgress, [0, 0.8], [0.15, 0.75]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none flex items-center justify-center py-[clamp(3rem,10vh,7rem)]"
    >
      <motion.div
        className="relative flex flex-col items-center"
        style={{ rowGap: gap, perspective: 600 }}
      >
        <motion.span
          className="u-bloom absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: glow }}
        />
        {Array.from({ length: 5 }, (_, i) => (
          <motion.span
            key={i}
            className="block h-[3px] border-t border-bone/25 bg-gradient-to-r from-transparent via-amber/35 to-transparent"
            style={{
              width,
              rotateX: tilt,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative overflow-hidden pb-[clamp(3rem,8vh,5rem)] pt-[clamp(4rem,10vh,7rem)]"
    >
      <RouteArrives />

      <div className="gut">
        {/* The closing statement */}
        <div className="flex items-baseline gap-4">
          <span className="label shrink-0 text-amber">09</span>
          <MaskText
            as="h2"
            lines={["Build something", "worth remembering."]}
            className="display text-d2 text-bone"
          />
        </div>

        {/* The address */}
        <div
          data-rise="up"
          style={riseDelay(2)}
          className="mt-[clamp(2.5rem,7vh,4.5rem)] border-t border-line pt-8"
        >
          <a
            href={`mailto:${site.email}`}
            data-cursor="Write"
            className="group inline-flex max-w-full flex-wrap items-baseline gap-x-4"
          >
            <span className="label text-dim">Say hello</span>
            <span className="relative">
              <span className="display break-all text-[clamp(1.375rem,4vw,3rem)] text-bone transition-colors duration-500 group-hover:text-amber">
                {site.email}
              </span>
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-amber transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100"
              />
            </span>
          </a>
        </div>

        {/* Channels + status */}
        <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-10 border-t border-line pt-8 lg:grid-cols-12">
          <div className="flex flex-wrap items-center gap-3 lg:col-span-7">
            {socials.map((s, i) => (
              <div key={s.label} data-rise="up" style={riseDelay(i)}>
                <ArrowLink
                  href={s.href}
                  external={!s.href.startsWith("mailto:")}
                  variant={i === 0 ? "filled" : "outline"}
                  cursorLabel={s.href.startsWith("mailto:") ? "Write" : "Open"}
                >
                  {s.label}
                </ArrowLink>
              </div>
            ))}
            <div data-rise="up" style={riseDelay(3)}>
              <ArrowLink
                href="/Udit-Mittal-Resume.pdf"
                external
                variant="outline"
                cursorLabel="Open PDF"
              >
                Resume
              </ArrowLink>
            </div>
          </div>

          <dl
            data-rise="up"
            style={riseDelay(3)}
            className="grid grid-cols-2 gap-x-6 gap-y-5 lg:col-span-4 lg:col-start-9"
          >
            <div>
              <dt className="label text-dim">Based in</dt>
              <dd className="mt-2 font-sans text-[0.9375rem] text-bone">
                {site.location}
              </dd>
            </div>
            <div>
              <dt className="label text-dim">Status</dt>
              <dd className="mt-2 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber u-pulse" />
                <span className="font-sans text-[0.9375rem] text-bone">
                  Open to 2027 roles
                </span>
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="label text-dim">Looking for</dt>
              <dd className="mt-2 max-w-[30ch] font-sans text-[0.9375rem] leading-[1.5] text-ash">
                Full-stack and backend roles where the hard part is the system.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
