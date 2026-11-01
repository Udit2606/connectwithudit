"use client";

import { motion } from "motion/react";

import { SPRING_LIGHT } from "@/data/overture";

/**
 * The light behind the type.
 *
 * Two very soft radial washes that drift and change scale as the scenes
 * advance, so the background is never quite static. This is the whole of the
 * "atmosphere" budget: no particles, no grain, no gradient mesh. At these
 * opacities it reads as a room being lit rather than as an effect.
 *
 * It sits under the type at `-z-10` and is `aria-hidden` — it carries no
 * information, only depth.
 */
export function Diffusion({ scene }: { scene: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-amber) 18%, transparent) 0%, transparent 62%)",
          filter: "blur(70px)",
        }}
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{
          opacity: [0.5, 0.42, 0.34][scene] ?? 0.34,
          scale: [0.82, 1, 1.18][scene] ?? 1.18,
          x: [0, "-6%", "4%"][scene] ?? 0,
          y: [0, "4%", "-5%"][scene] ?? 0,
        }}
        transition={SPRING_LIGHT}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-bone) 10%, transparent) 0%, transparent 58%)",
          filter: "blur(90px)",
        }}
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{
          opacity: [0.3, 0.42, 0.5][scene] ?? 0.5,
          scale: [1.2, 1.02, 0.88][scene] ?? 0.88,
          x: [0, "5%", "-4%"][scene] ?? 0,
        }}
        transition={SPRING_LIGHT}
      />
    </div>
  );
}
