"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";

import type { FlowKind, FlowNode } from "@/data/projects";
import { riseDelay } from "@/components/ui/Reveal";
import { EASE_OUT_EXPO } from "@/lib/animations/variants";
import { cn } from "@/lib/utils/cn";

/** Each stage kind gets its own mark, so the flow is readable at a glance. */
const KIND_MARK: Record<FlowKind, string> = {
  source: "M1 7h12M9 3l4 4-4 4",
  ingest: "M7 1v12M3 9l4 4 4-4",
  compute: "M2 2h10v10H2zM5 5h4v4H5z",
  model: "M7 1l6 3.5v5L7 13 1 9.5v-5L7 1zM7 1v12M1 4.5l12 5M13 4.5l-12 5",
  store: "M2 4c0-1.1 2.2-2 5-2s5 .9 5 2-2.2 2-5 2-5-.9-5-2zM2 4v6c0 1.1 2.2 2 5 2s5-.9 5-2V4",
  client: "M2 3h10v7H2zM5 12h4",
  egress: "M1 7h12M9 3l4 4-4 4",
};

const KIND_LABEL: Record<FlowKind, string> = {
  source: "Source",
  ingest: "Ingest",
  compute: "Compute",
  model: "Model",
  store: "Store",
  client: "Client",
  egress: "Output",
};

function StageMark({ kind }: { kind: FlowKind }) {
  return (
    <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden="true" fill="none">
      <path
        d={KIND_MARK[kind]}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
    </svg>
  );
}

type PipelineFlowProps = {
  nodes: FlowNode[];
  /** Compact drops the detail panel and tightens the rail for previews. */
  compact?: boolean;
  className?: string;
};

/**
 * An interactive stack trace of the system: stages down a spine, with the
 * selected stage's engineering rationale shown beside it.
 *
 * Built as a real listbox — arrow keys move between stages, the selection is
 * announced, and every stage's detail is reachable without a pointer.
 */
export function PipelineFlow({
  nodes,
  compact = false,
  className,
}: PipelineFlowProps) {
  const [active, setActive] = useState(0);
  const baseId = useId();

  const move = (dir: 1 | -1) =>
    setActive((i) => (i + dir + nodes.length) % nodes.length);

  return (
    <div
      className={cn(
        "grid gap-x-10 gap-y-8",
        !compact && "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]",
        className,
      )}
    >
      {/* ------------------------------------------------------------ spine */}
      <div
        role="listbox"
        aria-label="Pipeline stages"
        aria-activedescendant={`${baseId}-${active}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
        }}
        className="relative rounded-[3px] focus-visible:outline-2"
      >
        {/* The spine itself, drawn in on approach */}
        <span
          aria-hidden="true"
          data-rise="spine"
          className="absolute bottom-6 left-[0.9375rem] top-6 w-px origin-top bg-line-strong"
        />

        <ul className="relative space-y-0">
          {nodes.map((node, i) => {
            const isActive = i === active;
            return (
              <li key={node.id}>
                <button
                  type="button"
                  id={`${baseId}-${i}`}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  onPointerEnter={() => setActive(i)}
                  data-rise="side"
                  style={riseDelay(i)}
                  data-cursor-expand
                  className="group flex w-full items-center gap-4 py-2.5 text-left"
                >
                  {/* Node marker on the spine */}
                  <span
                    className={cn(
                      "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border transition-colors duration-400",
                      isActive
                        ? "border-amber bg-amber text-void"
                        : "border-line-strong bg-void text-dim group-hover:border-ash group-hover:text-ash",
                    )}
                  >
                    <StageMark kind={node.kind} />
                  </span>

                  <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className={cn(
                        "font-sans text-[clamp(0.9375rem,1.3vw,1.125rem)] font-medium tracking-[-0.01em] transition-colors duration-400",
                        isActive ? "text-bone" : "text-ash group-hover:text-bone",
                      )}
                    >
                      {node.label}
                    </span>
                    <span
                      className={cn(
                        "label transition-colors duration-400",
                        isActive ? "text-amber" : "text-faint",
                      )}
                    >
                      {node.sub}
                    </span>
                  </span>

                  <span className="label hidden shrink-0 text-faint sm:block">
                    {KIND_LABEL[node.kind]}
                  </span>
                </button>

                {/* Inline detail on narrow screens / compact previews */}
                {!compact ? (
                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.div
                        key="inline"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                        className="overflow-hidden lg:hidden"
                      >
                        <p className="ml-12 max-w-[46ch] pb-3 text-[0.9375rem] leading-[1.6] text-ash">
                          {node.detail}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ------------------------------------------------------ detail panel */}
      {!compact ? (
        <div className="hidden lg:block">
          <div className="sticky top-32 rounded-[4px] border border-line bg-ink/60 p-7 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="label text-amber">
                Stage {String(active + 1).padStart(2, "0")}
                <span className="text-faint">
                  {" "}
                  / {String(nodes.length).padStart(2, "0")}
                </span>
              </span>
              <span className="label text-dim">{KIND_LABEL[nodes[active].kind]}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={nodes[active].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                className="mt-6 space-y-4"
              >
                <h4 className="display text-[1.625rem] text-bone">
                  {nodes[active].label}
                </h4>
                <p className="text-[1rem] leading-[1.65] text-ash">
                  {nodes[active].detail}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress through the pipeline */}
            <div className="mt-8 flex gap-1.5" aria-hidden="true">
              {nodes.map((n, i) => (
                <span
                  key={n.id}
                  className={cn(
                    "h-0.5 flex-1 transition-colors duration-400",
                    i <= active ? "bg-amber" : "bg-line-strong",
                  )}
                />
              ))}
            </div>
            <p className="mt-4 label text-faint">
              Arrow keys to step through
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
