"use client";

import { createElement, useEffect, useRef } from "react";

import { cn } from "@/lib/utils/cn";

type MaskTextProps = {
  /** One entry per line. Pre-split so line breaks are a design decision. */
  lines: readonly string[];
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  lineClassName?: string;
  /** Plays on mount instead of waiting for the viewport. */
  immediate?: boolean;
};

/**
 * Lines rise out of their own overflow mask. The wrapper carries the mask so
 * the text stays a single, selectable, screen-reader-correct string.
 *
 * `data-rise="mask"` goes on the outer element, which is what the reveal
 * driver observes — the translated line sits below its clipping wrapper and
 * has no intersection rect of its own to observe.
 */
export function MaskText({
  lines,
  as = "div",
  className,
  lineClassName,
  immediate = false,
}: MaskTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!immediate) return;
    const el = ref.current;
    if (!el) return;
    // One frame late, so the transition has a state change to animate from.
    const id = requestAnimationFrame(() =>
      el.setAttribute("data-rise-in", ""),
    );
    return () => cancelAnimationFrame(id);
  }, [immediate]);

  const children = lines.map((line, i) => (
    <span key={`${line}-${i}`} className="block overflow-hidden pb-[0.08em]">
      <span className={cn("block will-change-transform", lineClassName)}>
        {line}
      </span>
    </span>
  ));

  return createElement(
    as,
    { className, ref, "data-rise": "mask" },
    children,
  );
}
