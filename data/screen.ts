/**
 * What the monitor in the hero says, in order.
 *
 * This lives in `data/` rather than next to the 3D component that draws it
 * for one blunt reason: the static fallback needs the same strings, and
 * importing them from the Three.js module pulled the entire 3D stack back
 * into the main bundle — 436kB First Load instead of 189kB, with the
 * `dynamic()` boundary still in place and doing nothing. Strings do not get
 * to carry a renderer with them.
 */
export const SCREEN_LINES = [
  "What if I could build it?",
  "Still figuring it out.",
] as const;
