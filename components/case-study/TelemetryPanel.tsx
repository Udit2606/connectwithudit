"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { EASE_IN_OUT_QUINT } from "@/lib/animations/variants";
import { useReveal } from "@/lib/hooks/useReveal";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils/cn";

const W = 760;
const H = 260;
const PAD = { t: 22, r: 16, b: 30, l: 16 };

/** Deterministic PRNG so the server and client draw the identical curve. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Series = {
  history: [number, number][];
  forecast: [number, number][];
  anomalies: [number, number][];
  splitX: number;
};

/**
 * A load curve with a forecast horizon and flagged outliers.
 *
 * This is an illustration of the system's behaviour — the shape of what the
 * platform does — not a recording of plant data, and it says so on screen.
 */
function buildSeries(): Series {
  const rand = seeded(20260617);
  const N = 96;
  const SPLIT = 64;

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const value = (i: number) => {
    const t = i / N;
    // Two shift changes a day plus a slow ramp — an industrial duty cycle.
    const base =
      0.46 +
      Math.sin(t * Math.PI * 2 - 0.6) * 0.2 +
      Math.sin(t * Math.PI * 6 + 1.2) * 0.07 +
      t * 0.12;
    return base + (rand() - 0.5) * 0.05;
  };

  const toPoint = (i: number, v: number): [number, number] => [
    PAD.l + (i / (N - 1)) * innerW,
    PAD.t + (1 - Math.min(Math.max(v, 0), 1)) * innerH,
  ];

  const history: [number, number][] = [];
  const forecast: [number, number][] = [];
  const anomalies: [number, number][] = [];

  for (let i = 0; i < N; i++) {
    let v = value(i);
    // Three injected outliers — the readings the Isolation Forest catches.
    const isAnomaly = i === 21 || i === 43 || i === 57;
    if (isAnomaly) v += 0.26;

    const p = toPoint(i, v);
    if (i <= SPLIT) history.push(p);
    if (i >= SPLIT) forecast.push(p);
    if (isAnomaly) anomalies.push(p);
  }

  return {
    history,
    forecast,
    anomalies,
    splitX: PAD.l + (SPLIT / (N - 1)) * innerW,
  };
}

/** Catmull-Rom → cubic Bézier. Smooth without overshooting the data. */
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

export function TelemetryPanel({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const series = useMemo(buildSeries, []);
  // The observer sits on an outer wrapper: the panel clips itself while
  // hidden, which would leave it permanently invisible to its own observer.
  const { ref, inView } = useReveal<HTMLDivElement>(false);
  const reduced = usePrefersReducedMotion();

  // A readout that ticks while visible — the dashboard is live, not a picture.
  const [reading, setReading] = useState(10_000);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(
      () => setReading(9_800 + Math.round(Math.random() * 520)),
      1400,
    );
    return () => clearInterval(id);
  }, [inView, reduced]);

  const historyPath = smoothPath(series.history);
  const forecastPath = smoothPath(series.forecast);
  const areaPath = `${historyPath}L${series.splitX.toFixed(2)},${H - PAD.b}L${PAD.l},${H - PAD.b}Z`;

  return (
    <div ref={ref} className={cn("relative", className)}>
    <motion.div
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={
        inView
          ? { clipPath: "inset(0 0 0% 0)" }
          : { clipPath: "inset(0 0 100% 0)" }
      }
      // A decorative wipe is exactly what reduced motion asks us to skip.
      transition={{ duration: reduced ? 0 : 1.2, ease: EASE_IN_OUT_QUINT }}
      className="relative overflow-hidden rounded-[4px] border border-line bg-ink"
    >
      {/* Header read-out */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative grid size-1.5 place-items-center">
            <span className="absolute inset-0 rounded-full bg-amber u-pulse" />
          </span>
          <span className="label text-ash">Live load</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="label tabular-nums text-bone">
            {reading.toLocaleString("en-US")}
            <span className="text-dim"> rdg/min</span>
          </span>
          {!compact ? (
            <span className="label text-dim">
              latency <span className="text-amber">&lt;1s</span>
            </span>
          ) : null}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Illustrative load curve showing recorded demand, a forecast horizon, and three flagged anomalies."
        preserveAspectRatio="none"
        style={{ height: compact ? 150 : 260 }}
      >
        <defs>
          <linearGradient id="tp-area" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              style={{ stopColor: "var(--color-amber)" }}
              stopOpacity="0.22"
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--color-amber)" }}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Baseline grid */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + (H - PAD.t - PAD.b) * f}
            y2={PAD.t + (H - PAD.t - PAD.b) * f}
            className="stroke-bone"
            strokeOpacity="0.055"
            strokeWidth="1"
          />
        ))}

        {/* Forecast horizon */}
        <rect
          x={series.splitX}
          y={PAD.t - 6}
          width={W - PAD.r - series.splitX}
          height={H - PAD.t - PAD.b + 6}
          className="fill-bone"
          fillOpacity="0.022"
        />
        <line
          x1={series.splitX}
          x2={series.splitX}
          y1={PAD.t - 6}
          y2={H - PAD.b}
          className="stroke-amber"
          strokeOpacity="0.4"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <text
          x={series.splitX + 8}
          y={PAD.t + 4}
          className="label fill-amber"
          fontSize="9"
          letterSpacing="1.6"
        >
          FORECAST
        </text>

        <path d={areaPath} fill="url(#tp-area)" />

        {/* Recorded demand */}
        <motion.path
          d={historyPath}
          fill="none"
          className="stroke-bone"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? 1 : 0 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* LSTM forecast */}
        <motion.path
          d={forecastPath}
          fill="none"
          className="stroke-amber"
          strokeWidth="1.6"
          strokeDasharray="5 5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            inView
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 1.4, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Anomalies flagged by the Isolation Forest */}
        {series.anomalies.map(([x, y], i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, delay: 1.5 + i * 0.14 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          >
            <circle
              cx={x}
              cy={y}
              r="9"
              fill="none"
              className="stroke-ember"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            <circle cx={x} cy={y} r="2.6" className="fill-ember" />
          </motion.g>
        ))}
      </svg>

      {/* Footer legend — keeps the illustration honest */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Legend swatch="bone" label="Recorded" />
          <Legend swatch="amber" label="LSTM forecast" dashed />
          <Legend swatch="ember" label="Anomaly" ring />
        </div>
        <span className="label text-faint">Illustrative — not plant data</span>
      </div>
    </motion.div>
    </div>
  );
}

function Legend({
  swatch,
  label,
  dashed,
  ring,
}: {
  swatch: "bone" | "amber" | "ember";
  label: string;
  dashed?: boolean;
  ring?: boolean;
}) {
  // Read through the tokens so the legend follows the substrate.
  const color = `var(--color-${swatch})`;
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className="flex h-2 w-5 items-center">
        {ring ? (
          <span
            className="block size-2 rounded-full border"
            style={{ borderColor: color }}
          />
        ) : (
          <span
            className="block h-px w-5"
            style={{
              backgroundColor: dashed ? "transparent" : color,
              backgroundImage: dashed
                ? `repeating-linear-gradient(to right, ${color} 0 3px, transparent 3px 6px)`
                : undefined,
            }}
          />
        )}
      </span>
      <span className="label text-dim">{label}</span>
    </span>
  );
}
