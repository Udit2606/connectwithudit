import type { CSSProperties } from "react";

/**
 * Stagger helper for the `data-rise` scroll-reveal system.
 *
 * Reveals are CSS transitions driven by one shared IntersectionObserver
 * (`components/chrome/RevealDriver`), so an element opts in with
 * `data-rise="up"` and sets its own delay through this variable. That keeps
 * staggered lists working without a hook per item.
 */
export const riseDelay = (i: number, extra = 0): CSSProperties =>
  ({ "--rise-delay": `${i * 70 + extra}ms` }) as CSSProperties;
