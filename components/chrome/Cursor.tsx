"use client";

import { useEffect, useRef, useState } from "react";

import { useDeviceTier } from "@/lib/hooks/useDeviceTier";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { damp } from "@/lib/utils/math";

/**
 * The system cursor, left exactly as it is, with one small companion: a thin
 * amber ring that trails it and opens up over anything clickable.
 *
 * Nothing is hidden or replaced. The arrow, the I-beam and the pointing hand
 * are the visitor's own; the ring only follows them, so it can never be the
 * reason someone cannot see where they are pointing.
 */
export function Cursor() {
  const { hasFinePointer } = useDeviceTier();
  const reduced = usePrefersReducedMotion();
  const enabled = hasFinePointer && !reduced;

  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [over, setOver] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { ...target };
    let raf = 0;
    let last = performance.now();
    let seen = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen) {
        // Start on the pointer rather than sliding in from the middle.
        seen = true;
        ring.x = target.x;
        ring.y = target.y;
        setVisible(true);
      }
      const el = (e.target as Element | null)?.closest?.(
        "a,button,[role='button'],[data-cursor],[data-cursor-expand]",
      );
      setOver((o) => (o === !!el ? o : !!el));
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // A soft trail: close enough to read as attached, loose enough to be felt.
      ring.x = damp(ring.x, target.x, 16, dt);
      ring.y = damp(ring.y, target.y, 16, dt);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });

    const onLeave = () => setVisible(false);
    const onEnter = () => seen && setVisible(true);
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

  const size = over ? 36 : 22;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .3s ease" }}
    >
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full border"
        style={{
          width: size,
          height: size,
          borderWidth: 1,
          // Mixed from the tokens, so it is the right amber on either substrate.
          borderColor: over
            ? "color-mix(in srgb, var(--color-amber) 75%, transparent)"
            : "color-mix(in srgb, var(--color-amber) 50%, transparent)",
          backgroundColor: over
            ? "color-mix(in srgb, var(--color-amber) 10%, transparent)"
            : "transparent",
          scale: pressed ? "0.85" : "1",
          transition:
            "width .45s var(--ease-out-expo), height .45s var(--ease-out-expo), border-color .3s ease, background-color .3s ease, scale .2s ease",
        }}
      />
    </div>
  );
}
