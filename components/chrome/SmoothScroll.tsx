"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

type ScrollApi = {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
  stop: () => void;
  start: () => void;
};

const ScrollContext = createContext<ScrollApi>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export const useSmoothScroll = () => useContext(ScrollContext);

/**
 * Lenis owns the scroll position, driven by a plain requestAnimationFrame
 * loop.
 *
 * There is deliberately no GSAP here. It was only ever being used as a ticker
 * for this loop — there are no ScrollTrigger instances on the site, since
 * scroll-linked motion is handled by `useScroll`/`useTransform` and reveals by
 * the CSS `data-rise` system. Shipping a 72KB animation engine to call
 * requestAnimationFrame is not a trade worth making.
 *
 * When reduced motion is requested Lenis is never instantiated at all: native
 * scrolling is the accessible default, and anchors fall back to instant jumps.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3.2),
      smoothWheel: true,
      touchMultiplier: 1.6,
      // Let the browser own horizontal gestures (trackpad back/forward).
      gestureOrientation: "vertical",
    });

    lenisRef.current = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    document.documentElement.classList.add("lenis");
    setReady(true);

    // Content height changes as sections reveal; keep Lenis' bounds honest.
    const ro = new ResizeObserver(() => lenis.resize());
    ro.observe(document.body);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("lenis");
    };
  }, [reduced]);

  const api: ScrollApi = {
    lenis: lenisRef.current,
    scrollTo: (target, offset = 0) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.4 });
        return;
      }
      // Reduced-motion / pre-init path.
      if (typeof target === "number") {
        window.scrollTo({ top: target + offset });
        return;
      }
      const el =
        typeof target === "string" ? document.querySelector(target) : target;
      if (el instanceof HTMLElement) {
        window.scrollTo({ top: el.offsetTop + offset });
      }
    },
    stop: () => lenisRef.current?.stop(),
    start: () => lenisRef.current?.start(),
  };

  return (
    <ScrollContext.Provider value={api}>
      {children}
      {/* Signals to e2e/debug that scroll is wired without affecting layout. */}
      <span className="u-sr" data-scroll-ready={ready} />
    </ScrollContext.Provider>
  );
}
