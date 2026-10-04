"use client";

import { motion } from "framer-motion";

import { EASE_IN_OUT_QUINT } from "@/lib/animations/variants";
import { useReveal } from "@/lib/hooks/useReveal";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils/cn";

const W = 760;
const H = 300;

/** Box geometry for the four tiers. */
const BOX = { w: 118, h: 50, r: 3 };

const NODES = {
  browser: { x: 24, y: 125, label: "Browser", sub: "Next.js 14" },
  gateway: { x: 196, y: 125, label: "API Gateway", sub: "4 REST APIs" },
  lambda: { x: 368, y: 125, label: "Lambda", sub: "0 → 1,000+" },
  dynamo: { x: 540, y: 196, label: "DynamoDB", sub: "single-table" },
  s3: { x: 540, y: 54, label: "Amazon S3", sub: "object store" },
} as const;

const cx = (n: { x: number }) => n.x + BOX.w / 2;
const cy = (n: { y: number }) => n.y + BOX.h / 2;

/**
 * The request path, with the point of the architecture made visible: the
 * control plane runs Browser → Gateway → Lambda → DynamoDB, while file bytes
 * take the pre-signed shortcut straight from the browser to S3.
 *
 * The bypass is drawn as the long arc precisely because it is the hop that
 * was *removed* from the API — that is what cut upload latency in half.
 */
export function RequestPath({
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

  // Control plane: browser → gateway → lambda → dynamo
  const control = `M${cx(NODES.browser)},${cy(NODES.browser)} H${cx(NODES.gateway)} M${cx(NODES.gateway)},${cy(NODES.gateway)} H${cx(NODES.lambda)} M${cx(NODES.lambda)},${cy(NODES.lambda)} H${NODES.dynamo.x - 20} Q${cx(NODES.dynamo)},${cy(NODES.lambda)} ${cx(NODES.dynamo)},${NODES.dynamo.y}`;

  // Data plane: browser → S3, arcing over the API entirely
  const bypass = `M${cx(NODES.browser)},${NODES.browser.y} C${cx(NODES.browser)},${-30} ${cx(NODES.s3)},${-30} ${cx(NODES.s3)},${NODES.s3.y}`;

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
        <span className="label text-ash">Request path</span>
        <span className="label text-dim">
          control plane <span className="text-faint">vs</span>{" "}
          <span className="text-amber">data plane</span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Architecture diagram: the browser calls API Gateway, which invokes Lambda, which reads and writes DynamoDB. File bytes travel directly from the browser to Amazon S3 on a pre-signed URL, bypassing the API layer."
        style={{ height: compact ? 190 : 300 }}
      >
        <defs>
          <marker
            id="rp-arrow"
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path
              d="M1 1l5 3-5 3"
              fill="none"
              className="stroke-dim"
              strokeWidth="1.2"
            />
          </marker>
          <marker
            id="rp-arrow-amber"
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path
              d="M1 1l5 3-5 3"
              fill="none"
              className="stroke-amber"
              strokeWidth="1.2"
            />
          </marker>
        </defs>

        {/* ---- edges ---- */}
        <path
          d={control}
          fill="none"
          className="stroke-faint"
          strokeWidth="1.2"
          markerEnd="url(#rp-arrow)"
        />
        <path
          d={bypass}
          fill="none"
          className="stroke-amber"
          strokeOpacity="0.65"
          strokeWidth="1.4"
          strokeDasharray="6 5"
          markerEnd="url(#rp-arrow-amber)"
        />

        {/* ---- packets ---- */}
        {!reduced ? (
          <>
            {[0, 1, 2].map((i) => (
              <circle key={`c${i}`} r="2.6" className="fill-bone" opacity="0.75">
                <animateMotion
                  dur="3.2s"
                  begin={`${i * 1.05}s`}
                  repeatCount="indefinite"
                  path={control}
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="linear"
                />
              </circle>
            ))}
            {[0, 1].map((i) => (
              <circle key={`b${i}`} r="3.4" className="fill-amber">
                <animateMotion
                  dur="2.1s"
                  begin={`${i * 1.05}s`}
                  repeatCount="indefinite"
                  path={bypass}
                />
              </circle>
            ))}
          </>
        ) : null}

        {/* ---- bypass annotation ---- */}
        <g>
          <text
            x={cx(NODES.browser) + 86}
            y={22}
            fontSize="9"
            letterSpacing="1.6"
            className="label fill-amber"
          >
            PRE-SIGNED URL — BYPASSES THE API
          </text>
        </g>

        {/* ---- nodes ---- */}
        {(Object.keys(NODES) as (keyof typeof NODES)[]).map((key, i) => {
          const n = NODES[key];
          const isData = key === "s3";
          return (
            <motion.g
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.09 }}
            >
              <rect
                x={n.x}
                y={n.y}
                width={BOX.w}
                height={BOX.h}
                rx={BOX.r}
                className={cn(
                  "fill-slate",
                  isData ? "stroke-amber" : "stroke-line-strong",
                )}
                strokeOpacity={isData ? 0.75 : 1}
                strokeWidth="1"
              />
              <text
                x={n.x + 12}
                y={n.y + 21}
                fontSize="12.5"
                className="fill-bone"
                fontWeight="500"
              >
                {n.label}
              </text>
              <text
                x={n.x + 12}
                y={n.y + 37}
                fontSize="8.5"
                letterSpacing="1.4"
                className={cn("label", isData ? "fill-amber" : "fill-dim")}
              >
                {n.sub.toUpperCase()}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line px-5 py-3">
        <span className="label text-dim">
          Lambda mints the URL — it never touches the bytes
        </span>
        <span className="label text-amber">−50% upload latency</span>
      </div>
    </motion.div>
    </div>
  );
}
