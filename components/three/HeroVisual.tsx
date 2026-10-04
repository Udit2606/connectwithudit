"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/chrome/Theme";
import { SCREEN_LINES } from "@/data/screen";
import { useDeviceTier } from "@/lib/hooks/useDeviceTier";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/**
 * Three.js is ~170kB gzipped and nothing above the fold needs it to render.
 * It is loaded only after mount, and only on devices that asked for it.
 */
const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

/** The graph above the figure, as a flat drawing. */
const NODES: [number, number][] = [
  [118, 58],
  [96, 44],
  [140, 40],
  [108, 28],
  [152, 22],
  [78, 26],
  [130, 14],
];
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [1, 5],
  [3, 5],
  [4, 6],
  [3, 6],
];

/**
 * The static composition that stands in for the scene on low-tier devices,
 * when WebGL is unavailable, and when reduced motion is requested.
 *
 * It is not an empty box — it is the same subject, drawn flat: a figure at a
 * lit desk, the line still on the screen, the graph still above their head.
 * Every colour comes from the same tokens as the page, so it flips with the
 * substrate like everything else.
 */
function StaticDesk() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <svg
        viewBox="0 0 240 190"
        preserveAspectRatio="xMidYMid meet"
        className="relative h-[min(82vh,44rem)] w-[min(86vw,46rem)]"
      >
        <defs>
          <radialGradient id="hv-screen" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              style={{ stopColor: "var(--color-amber)" }}
              stopOpacity="0.4"
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--color-amber)" }}
              stopOpacity="0"
            />
          </radialGradient>
          <linearGradient id="hv-panel" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              style={{ stopColor: "var(--color-amber)" }}
              stopOpacity="0.22"
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--color-ember)" }}
              stopOpacity="0.1"
            />
          </linearGradient>
        </defs>

        {/* The light the screen throws into the room */}
        <circle cx="134" cy="96" r="76" fill="url(#hv-screen)" />

        {/* The graph he is thinking about */}
        <g className="stroke-amber" strokeOpacity="0.3" strokeWidth="0.5">
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={NODES[a][0]}
              y1={NODES[a][1]}
              x2={NODES[b][0]}
              y2={NODES[b][1]}
            />
          ))}
        </g>
        <g className="fill-amber" fillOpacity="0.55">
          {NODES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.7 : 1.2} />
          ))}
        </g>

        {/* Monitor, facing the viewer */}
        <rect
          x="94"
          y="64"
          width="104"
          height="58"
          rx="2"
          fill="url(#hv-panel)"
          className="stroke-line-strong"
          strokeWidth="1.2"
        />
        <text
          x="146"
          y="95"
          textAnchor="middle"
          fontSize="9.5"
          className="fill-amber font-serif"
        >
          {SCREEN_LINES[0]}
        </text>

        {/* Second screen, angled away */}
        <path
          d="M206 76 L228 82 L228 112 L206 118 Z"
          className="fill-slate stroke-line-strong"
          strokeWidth="0.8"
        />

        {/* Desk */}
        <rect x="44" y="126" width="164" height="2.6" className="fill-bone" fillOpacity="0.1" />
        <rect x="44" y="126" width="164" height="0.8" className="fill-amber" fillOpacity="0.4" />
        <g className="stroke-line-strong" strokeWidth="1.2">
          <path d="M54 128 V166 M198 128 V166" />
        </g>

        {/* Keyboard + mug */}
        <rect x="84" y="122" width="34" height="3" rx="1" className="fill-bone" fillOpacity="0.14" />
        <rect x="150" y="116" width="9" height="9" rx="1.5" className="fill-bone" fillOpacity="0.1" />

        {/* The figure — a silhouette against the panel, which is all it needs */}
        <g className="fill-void">
          <circle cx="104" cy="88" r="9" />
          <path d="M104 97 Q94 101 92 122 L116 122 Q114 101 104 97 Z" />
          <path d="M112 104 Q124 110 126 122" fill="none" className="stroke-void" strokeWidth="5" strokeLinecap="round" />
          <path d="M96 104 Q86 110 88 122" fill="none" className="stroke-void" strokeWidth="5" strokeLinecap="round" />
        </g>
        {/* Rim light down the near edge of the silhouette */}
        <path
          d="M113 80 Q118 90 117 104"
          fill="none"
          className="stroke-amber"
          strokeOpacity="0.4"
          strokeWidth="0.8"
        />

        {/* Chair */}
        <path
          d="M88 86 L88 120"
          className="stroke-bone"
          strokeOpacity="0.14"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M100 128 V158 M84 164 H118" className="stroke-line-strong" strokeWidth="1.2" />

        {/* Floor datum */}
        <ellipse
          cx="124"
          cy="168"
          rx="86"
          ry="7"
          fill="none"
          className="stroke-amber"
          strokeOpacity="0.14"
          strokeWidth="0.7"
        />
      </svg>
    </div>
  );
}

export function HeroVisual({
  progress,
  ready,
}: {
  progress: React.RefObject<number>;
  /**
   * Held false until the intro has finished. Compiling shaders and warming
   * the renderer costs main-thread time, and the hero wordmark is the LCP
   * element — the object arrives just after the type has landed, not during.
   */
  ready: boolean;
}) {
  const { allow3D, tier, dprCap } = useDeviceTier();
  const reduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [idle, setIdle] = useState(false);

  // Defer the 3D import past first paint so LCP is never behind it.
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setIdle(true), { timeout: 600 });
      return () => (window as unknown as { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setIdle(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Stop rendering entirely once the hero is off screen — no wasted GPU.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const render3D = allow3D && !reduced && ready && idle && inView;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {/* Amber bloom behind the object — a cheap stand-in for post-processing. */}
      <div
        aria-hidden="true"
        className="u-bloom left-1/2 top-1/2 size-[min(85vw,44rem)] -translate-x-1/2 -translate-y-1/2 opacity-60 lg:left-[68%]"
      />
      {render3D ? (
        <HeroCanvas
          progress={progress}
          quality={tier === "high" ? "high" : "mid"}
          dprCap={dprCap}
          theme={theme}
        />
      ) : (
        <StaticDesk />
      )}
    </div>
  );
}
