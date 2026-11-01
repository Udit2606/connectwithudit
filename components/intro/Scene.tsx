"use client";

import type { ReactNode } from "react";

/**
 * One scene of the overture.
 *
 * All three scenes stay mounted and are posed from the sequence's state
 * rather than added and removed, and the posing is done in CSS rather than
 * by the animation library. Both of those are decisions made from failures:
 *
 * - `AnimatePresence` never completed the scene exits, so the scenes piled
 *   up on top of one another at full opacity.
 * - Driving the poses through the library's `animate` prop left every scene
 *   exactly one step behind the sequence — arriving as it should be
 *   leaving — because those animations are stepped from requestAnimationFrame
 *   and this piece changes state on timers.
 *
 * CSS transitions are driven by the compositor instead, so they cannot fall
 * behind the state that sets them, they keep running when the main thread is
 * busy, and opacity/filter/transform are the three properties that composite
 * without layout. The transition itself is in `globals.css` under OVERTURE.
 *
 * Every scene arrives out of focus, fractionally large and a little low, and
 * leaves by *continuing* that move rather than reversing it — still rising,
 * still softening — so the eye reads one travelling gesture.
 */
export type Pose = "before" | "present" | "after";

export function Scene({
  pose,
  children,
  className,
}: {
  pose: Pose;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-scene={pose}
      className={className}
      // Not the current scene: cannot be clicked, and is not read out —
      // the document says all of this again in the hero.
      aria-hidden={pose !== "present"}
    >
      {children}
    </div>
  );
}
