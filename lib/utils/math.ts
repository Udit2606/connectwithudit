export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(Math.max(v, min), max);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Frame-rate independent damping — eases `current` toward `target` at a rate
 * set by `lambda`, so the feel is identical at 60Hz and 120Hz. Used by the
 * cursor and the hero sculpture instead of a fixed-factor lerp.
 */
export const damp = (
  current: number,
  target: number,
  lambda: number,
  dt: number,
) => lerp(current, target, 1 - Math.exp(-lambda * dt));
