"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { useDeviceTier } from "@/lib/hooks/useDeviceTier";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

type MagneticProps = {
  children: ReactNode;
  /** Peak displacement in px. Keep it small — this should be felt, not seen. */
  strength?: number;
  className?: string;
};

/** Pulls toward the cursor while hovered, springs home on exit. */
export function Magnetic({
  children,
  strength = 14,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { hasFinePointer } = useDeviceTier();
  const reduced = usePrefersReducedMotion();
  const enabled = hasFinePointer && !reduced;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 22, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 220, damping: 22, mass: 0.4 });

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        rawX.set(Math.max(-1, Math.min(1, dx)) * strength);
        rawY.set(Math.max(-1, Math.min(1, dy)) * strength);
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
