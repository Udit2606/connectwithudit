"use client";

/**
 * The light behind the greeting.
 *
 * Two very soft radial washes that drift and change scale as the scenes
 * advance, so the background is never quite static. This is the whole of
 * the atmosphere budget — no particles, no grain, no gradient mesh. At
 * these opacities it reads as a room being lit rather than as an effect.
 *
 * Posed from inline values with the transition in CSS, like the scenes
 * themselves: the sequence advances on timers, and anything stepped from
 * requestAnimationFrame arrives a beat late when the main thread is busy.
 */
const WARM = [
  { opacity: 0.5, scale: 0.82, x: "0%", y: "0%" },
  { opacity: 0.4, scale: 1.14, x: "-5%", y: "4%" },
];

const COOL = [
  { opacity: 0.3, scale: 1.2, x: "0%" },
  { opacity: 0.46, scale: 0.92, x: "5%" },
];

const at = <T,>(list: T[], i: number): T => list[Math.min(i, list.length - 1)];

export function Diffusion({ scene }: { scene: number }) {
  const warm = at(WARM, scene);
  const cool = at(COOL, scene);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        data-wash
        className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-amber) 18%, transparent) 0%, transparent 62%)",
          filter: "blur(70px)",
          opacity: warm.opacity,
          transform: `translate(-50%, -50%) translate(${warm.x}, ${warm.y}) scale(${warm.scale})`,
        }}
      />
      <div
        data-wash
        className="absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-bone) 10%, transparent) 0%, transparent 58%)",
          filter: "blur(90px)",
          opacity: cool.opacity,
          transform: `translate(-50%, -50%) translate(${cool.x}, 0%) scale(${cool.scale})`,
        }}
      />
    </div>
  );
}
