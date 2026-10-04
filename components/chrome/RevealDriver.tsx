"use client";

import { useEffect } from "react";

/**
 * One observer for every scroll reveal on the page.
 *
 * Elements opt in with `data-rise="<variant>"`; this sets `data-rise-in` on
 * them when they enter the viewport, and CSS does the rest. A single shared
 * observer is cheaper than one per element, works inside `.map()` without a
 * hook per item, and keeps the reveal system independent of the animation
 * library.
 *
 * Hidden states live unconditionally in CSS so the first paint is correct.
 * The <noscript> style in the document head covers scripts being unavailable,
 * and the no-IntersectionObserver path below reveals everything at once.
 */
export function RevealDriver() {
  useEffect(() => {
    const revealAll = () => {
      for (const el of document.querySelectorAll("[data-rise]")) {
        el.setAttribute("data-rise-in", "");
      }
    };

    // No observer available: show everything rather than hide it forever.
    if (typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-rise-in", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      for (const el of document.querySelectorAll("[data-rise]")) {
        if (seen.has(el) || el.hasAttribute("data-rise-in")) continue;
        seen.add(el);
        io.observe(el);
      }
    };

    scan();

    // Sections mount progressively and routes change; keep picking up new nodes.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
