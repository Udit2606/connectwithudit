"use client";

import { useEffect, useRef, useState } from "react";

type RevealOptions = {
  /** Latch on first entry and stop observing. */
  once?: boolean;
  /** rootMargin, px or %. Bottom inset only, by default. */
  margin?: string;
  threshold?: number;
};

/**
 * Scroll-reveal trigger on a native IntersectionObserver.
 *
 * Framer Motion's own `whileInView` / `useInView` do not activate in this
 * project's version, so in-view detection is owned here instead. Two rules
 * matter:
 *
 *  1. Observe a *stable* element. A hidden state that translates an element
 *     out of a clipping parent, or clips it to zero area, makes it invisible
 *     to its own observer — so the reveal could never fire. Put the ref on an
 *     un-clipped wrapper and drive children from the returned flag.
 *  2. Fail open. If IntersectionObserver is unavailable, report "in view"
 *     immediately, so content is never hidden by a missing capability.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions | boolean = {},
) {
  // `useReveal(false)` is shorthand for a re-triggering observer.
  const opts: RevealOptions =
    typeof options === "boolean" ? { once: options } : options;
  const { once = true, margin = "0px 0px -10% 0px", threshold = 0 } = opts;

  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin: margin, threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, margin, threshold]);

  return { ref, inView };
}
