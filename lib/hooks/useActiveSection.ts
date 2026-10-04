"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which registered section owns the viewport.
 * Uses a band across the middle of the screen so short sections still win.
 */
/* Starts empty: nothing should look selected until a section actually owns
 * the viewport, otherwise the hero makes the first nav item light up. */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
