"use client";

import { useEffect, useRef, useState } from "react";

import { useDeviceTier } from "@/lib/hooks/useDeviceTier";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { damp } from "@/lib/utils/math";

type CursorMode = "dot" | "expand" | "label";

/**
 * A three-part cursor: a leading dot, a trailing ring, and a label chip.
 *
 * The chip is a separate element rather than the ring morphing into one —
 * animating a container's width to `auto` clips its own text mid-transition,
 * which is how "Open" ends up rendering as "ON".
 *
 * The dot uses `mix-blend-mode: difference` so it stays visible over the
 * warm-white buttons without needing to know what it is sitting on.
 */
export function Cursor() {
  const { hasFinePointer } = useDeviceTier();
  const reduced = usePrefersReducedMotion();
  const enabled = hasFinePointer && !reduced;

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<CursorMode>("dot");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) root.setAttribute("data-cursor", "on");
    else root.removeAttribute("data-cursor");
    return () => root.removeAttribute("data-cursor");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { ...target };
    const ring = { ...target };
    const chip = { ...target };
    let raf = 0;
    let last = performance.now();
    let seen = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen) {
        seen = true;
        setVisible(true);
      }

      const el = (e.target as Element | null)?.closest?.(
        "[data-cursor],[data-cursor-expand],a,button",
      );

      if (!el) {
        setMode((m) => (m === "dot" ? m : "dot"));
        return;
      }

      const text = el.getAttribute("data-cursor");
      if (text) {
        setLabel((l) => (l === text ? l : text));
        setMode("label");
      } else {
        setMode((m) => (m === "expand" ? m : "expand"));
      }
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Three different rates is what sells it as a physical object: the dot
      // tracks tightly, the ring trails, the chip follows further behind.
      dot.x = damp(dot.x, target.x, 30, dt);
      dot.y = damp(dot.y, target.y, 30, dt);
      ring.x = damp(ring.x, target.x, 13, dt);
      ring.y = damp(ring.y, target.y, 13, dt);
      chip.x = damp(chip.x, target.x, 9, dt);
      chip.y = damp(chip.y, target.y, 9, dt);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      if (chipRef.current) {
        chipRef.current.style.transform = `translate3d(${chip.x}px, ${chip.y}px, 0) translate(1.25rem, 0.9rem)`;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  const isLabel = mode === "label";
  const isExpand = mode === "expand";
  const ringSize = isLabel ? 46 : isExpand ? 42 : 26;
  const press = pressed ? 0.88 : 1;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .3s ease" }}
    >
      {/* Trailing ring — a hairline, not a border */}
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full border"
        style={{
          width: ringSize,
          height: ringSize,
          // Mixed from the tokens rather than written out, so the ring is
          // warm-white on the dark substrate and ink on the light one.
          borderColor: isLabel
            ? "color-mix(in srgb, var(--color-amber) 55%, transparent)"
            : isExpand
              ? "color-mix(in srgb, var(--color-bone) 40%, transparent)"
              : "color-mix(in srgb, var(--color-bone) 22%, transparent)",
          borderWidth: 1,
          scale: String(press),
          transition:
            "width .5s var(--ease-out-expo), height .5s var(--ease-out-expo), border-color .35s ease, scale .2s ease",
        }}
      />

      {/* Leading dot — inverts against whatever is underneath */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: 6,
          height: 6,
          backgroundColor: "var(--color-bone)",
          mixBlendMode: "difference",
          opacity: isLabel ? 0 : 1,
          transition: "opacity .25s ease",
        }}
      />

      {/* Label chip — dark glass, amber indicator, never a solid slab */}
      <div
        ref={chipRef}
        className="absolute left-0 top-0 flex items-center gap-2 rounded-full border border-line-strong bg-void/85 py-2 pl-2.5 pr-3.5 backdrop-blur-md"
        style={{
          opacity: isLabel ? 1 : 0,
          scale: isLabel ? "1" : "0.86",
          transformOrigin: "top left",
          transition:
            "opacity .3s var(--ease-out-expo), scale .4s var(--ease-out-expo)",
          boxShadow: "0 8px 30px -12px rgb(0 0 0 / 0.8)",
        }}
      >
        <span className="size-1.5 shrink-0 rounded-full bg-amber" />
        <span className="label whitespace-nowrap text-bone">{label}</span>
      </div>
    </div>
  );
}
