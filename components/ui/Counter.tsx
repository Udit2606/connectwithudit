"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useReveal } from "@/lib/hooks/useReveal";

type CounterProps = {
  /** Display value verbatim, e.g. "9,100+" or "1.2s → 300ms". */
  value: string;
  className?: string;
};

/**
 * Counts the numeric part of a metric up on first view, preserving every
 * non-numeric character (commas, +, <, →, ms). If there is no single clean
 * number to animate, it renders the string as-is — which is the right call
 * for values like "0 → 1,000+".
 */
export function Counter({ value, className }: CounterProps) {
  /* Framer Motion's `useInView` does not activate in this project's version
     — the same framework bug that killed every scroll reveal — so this used
     to render its value and never count at all. Native observer instead. */
  const { ref, inView } = useReveal<HTMLSpanElement>({
    once: true,
    margin: "0px 0px -15% 0px",
  });
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState<string | null>(null);

  // Animate only when the value contains exactly one number.
  const numbers = value.match(/[\d.,]+/g) ?? [];
  const animatable = numbers.length === 1 && !reduced;
  const raw = animatable ? Number(numbers[0].replace(/,/g, "")) : 0;
  /* Count the decimals the value actually has rather than assuming one.
     This was hardcoded to `toFixed(1)`, which rendered a CGPA of 8.51 as
     8.5 — quietly changing a figure on its way to the screen, which is the
     one thing a component displaying someone's results must never do. */
  const decimals = animatable ? (numbers[0].split(".")[1]?.length ?? 0) : 0;

  useEffect(() => {
    if (!inView || !animatable || !Number.isFinite(raw) || raw === 0) return;

    const DURATION = 1300;
    let frame = 0;
    const start = performance.now();

    const format = (n: number) => {
      const fixed = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
      const grouped =
        decimals > 0 ? fixed : Number(fixed).toLocaleString("en-US");
      return value.replace(/[\d.,]+/, grouped);
    };

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      // expo-out: fast arrival, long settle
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(format(raw * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, animatable, raw, decimals, value]);

  return (
    <span ref={ref} className={className}>
      {/* The true value is always in the DOM for assistive tech. */}
      <span className="u-sr">{value}</span>
      <span aria-hidden="true">{display ?? value}</span>
    </span>
  );
}
