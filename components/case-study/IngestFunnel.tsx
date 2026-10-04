"use client";

import { motion } from "framer-motion";

import { EASE_IN_OUT_QUINT } from "@/lib/animations/variants";
import { useReveal } from "@/lib/hooks/useReveal";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils/cn";

const W = 760;
const H = 300;

const SOURCES = [
  "Greenhouse",
  "Lever",
  "Ashby",
  "SmartRecruiters",
  "Workday",
] as const;

const SRC_X = 150;
const GATE_X = 392;
const DB_X = 620;
const MID_Y = H / 2;

/**
 * Five ATS sources converging on a single deterministic gate, then one store.
 *
 * The funnel shape is the whole argument: five different payload contracts go
 * in, one reproducible schema comes out, and only then does anything read it.
 */
export function IngestFunnel({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  // Observed on an outer wrapper — the panel clips itself while hidden,
  // so observing the panel directly would never report it in view.
  const { ref, inView } = useReveal<HTMLDivElement>();

  const rowY = (i: number) =>
    48 + (i * (H - 96)) / (SOURCES.length - 1);

  /** Source row → the gate, as a smooth convergence. */
  const edge = (i: number) => {
    const y = rowY(i);
    return `M${SRC_X},${y} C${SRC_X + 100},${y} ${GATE_X - 80},${MID_Y} ${GATE_X - 14},${MID_Y}`;
  };

  const outEdge = `M${GATE_X + 56},${MID_Y} H${DB_X - 14}`;

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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <span className="label text-ash">Ingestion</span>
        <span className="label text-dim">
          daily refresh · <span className="text-amber">58 boards</span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Five applicant tracking systems — Greenhouse, Lever, Ashby, SmartRecruiters and Workday — converge on a single deterministic normalisation step, which writes to one PostgreSQL store."
        style={{ height: compact ? 190 : 300 }}
      >
        {/* ---- convergence edges ---- */}
        {SOURCES.map((s, i) => (
          <g key={s}>
            <motion.path
              d={edge(i)}
              fill="none"
              className="stroke-line-strong"
              strokeWidth="1.1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: inView ? 1 : 0 }}
              transition={{ duration: 1.1, delay: 0.25 + i * 0.07 }}
            />
            {!reduced ? (
              <circle r="2.2" className="fill-bone" opacity="0.6">
                <animateMotion
                  dur="2.6s"
                  begin={`${i * 0.42}s`}
                  repeatCount="indefinite"
                  path={edge(i)}
                />
              </circle>
            ) : null}
          </g>
        ))}

        {/* ---- source labels ---- */}
        {SOURCES.map((s, i) => (
          <motion.g
            key={`l${s}`}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.07 }}
          >
            <text
              x={SRC_X - 14}
              y={rowY(i) + 3.5}
              textAnchor="end"
              fontSize="11.5"
              className="fill-ash"
            >
              {s}
            </text>
            <circle cx={SRC_X - 5} cy={rowY(i)} r="2" className="fill-dim" />
          </motion.g>
        ))}

        {/* ---- the deterministic gate ---- */}
        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{ transformOrigin: `${GATE_X + 21}px ${MID_Y}px` }}
        >
          {/* A hexagon: a gate, not a box. */}
          <path
            d={`M${GATE_X + 21},${MID_Y - 46} L${GATE_X + 56},${MID_Y - 23} L${GATE_X + 56},${MID_Y + 23} L${GATE_X + 21},${MID_Y + 46} L${GATE_X - 14},${MID_Y + 23} L${GATE_X - 14},${MID_Y - 23} Z`}
            className="fill-slate stroke-amber"
            strokeWidth="1.1"
          />
          <text
            x={GATE_X + 21}
            y={MID_Y - 4}
            textAnchor="middle"
            fontSize="11.5"
            className="fill-bone"
            fontWeight="500"
          >
            Normalise
          </text>
          <text
            x={GATE_X + 21}
            y={MID_Y + 11}
            textAnchor="middle"
            fontSize="8.5"
            letterSpacing="1.3"
            className="label fill-amber"
          >
            RULES, NOT LLM
          </text>
        </motion.g>

        {/* ---- gate → store ---- */}
        <path
          d={outEdge}
          fill="none"
          className="stroke-line-strong"
          strokeWidth="1.1"
        />
        {!reduced ? (
          <circle r="2.8" className="fill-amber">
            <animateMotion dur="1.5s" repeatCount="indefinite" path={outEdge} />
          </circle>
        ) : null}

        {/* ---- the store ---- */}
        <motion.g
          initial={{ opacity: 0, x: 10 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.6, delay: 0.72 }}
        >
          <rect
            x={DB_X - 14}
            y={MID_Y - 32}
            width={124}
            height={64}
            rx="3"
            className="fill-slate stroke-line-strong"
          />
          <text
            x={DB_X}
            y={MID_Y - 8}
            fontSize="12.5"
            className="fill-bone"
            fontWeight="500"
          >
            PostgreSQL
          </text>
          <text
            x={DB_X}
            y={MID_Y + 7}
            fontSize="8.5"
            letterSpacing="1.3"
            className="label fill-dim"
          >
            ROW-LEVEL SECURITY
          </text>
          <text
            x={DB_X}
            y={MID_Y + 23}
            fontSize="10.5"
            className="tabular-nums fill-amber"
          >
            9,100+ roles
          </text>
        </motion.g>
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line px-5 py-3">
        <span className="label text-dim">
          Same payload in → same row out, every run
        </span>
        <span className="label text-amber">5 adapters, 1 schema</span>
      </div>
    </motion.div>
    </div>
  );
}
