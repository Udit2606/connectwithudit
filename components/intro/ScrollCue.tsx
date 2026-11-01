"use client";

import { motion } from "motion/react";

import { overture } from "@/data/overture";

/**
 * The scroll indicator: a label and a hairline with a mote falling down it.
 *
 * Deliberately the quietest thing on screen. It is the one element in the
 * overture that is an instruction rather than a statement, so it arrives
 * last, sits smallest, and never animates faster than the type above it.
 */
export function ScrollCue({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-3"
    >
      <span className="label text-dim">{overture.scroll}</span>
      <span
        aria-hidden="true"
        className="relative h-10 w-px overflow-hidden bg-line-strong"
      >
        <motion.span
          className="absolute inset-x-0 h-3 bg-amber"
          initial={{ y: "-100%" }}
          animate={{ y: "320%" }}
          transition={{ duration: 2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        />
      </span>
    </motion.div>
  );
}
