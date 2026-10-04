import * as THREE from "three";

export type SceneTheme = "dark" | "light";

/**
 * The scene's colour and exposure, per substrate.
 *
 * Two things are not negotiable across the two, and they are the reason this
 * is a function rather than a constant:
 *
 * - `fog` has to be the page's own background, or the room fades out into a
 *   grey haze that reads as a rectangle floating on the page.
 * - `blending` has to change. Additive blending is how you draw light, and it
 *   is completely invisible on a warm white — adding to something already
 *   near 1.0 does nothing. On paper the motes and dust have to be drawn as
 *   dark marks with normal blending instead.
 *
 * The figure stays near-black in both. A dark silhouette works against a
 * bright room as readily as a lit one; making it pale on paper would only
 * turn it back into a mannequin.
 */
export type ScenePalette = {
  amber: string;
  ember: string;
  /** The light the monitor throws into the room. */
  screen: string;
  /** Figure and furniture. */
  solid: string;
  /** Stands, legs, hinges. */
  metal: string;
  /** The cold separation light from behind. */
  cool: string;
  /** Rising motes above the desk. */
  mote: string;
  /** Ambient motes in the surrounding volume. */
  dust: string;
  /** Must match the page substrate exactly. */
  fog: string;
  /** Screen panel background and type. */
  panel: string;
  panelInk: string;
  panelDim: string;
  blending: THREE.Blending;
  exposure: number;
  ambient: number;
  /** Multiplier on the monitor's key light. */
  key: number;
  /** Multiplier on anything volumetric — light cones, glow planes. */
  glow: number;
  /** Multiplier on wireframe and particle opacity. */
  ink: number;
};

const DARK: ScenePalette = {
  amber: "#ff9a3c",
  ember: "#f2701d",
  screen: "#ffb066",
  // Not pure black: at #06060a there is no albedo for the rim light to
  // catch, so the parts of the figure that fall outside the panel went to
  // nothing. This still reads as a silhouette and now has an edge.
  solid: "#0b0b11",
  metal: "#15151b",
  cool: "#6b7a99",
  mote: "#ff9a3c",
  dust: "#f4f1ea",
  fog: "#09090b",
  panel: "#140d06",
  panelInk: "#ffe8cd",
  panelDim: "#ff9a3c",
  blending: THREE.AdditiveBlending,
  exposure: 1.15,
  ambient: 0.05,
  key: 1,
  glow: 1,
  ink: 1,
};

const LIGHT: ScenePalette = {
  amber: "#b04c06",
  ember: "#8e3a04",
  // Still warm, but it is daylight in the room now — the screen stops being
  // the only light source and becomes one surface among several.
  screen: "#ffd4a3",
  solid: "#121217",
  metal: "#8d8880",
  cool: "#8e9bb4",
  mote: "#b04c06",
  dust: "#3e3b34",
  fog: "#f5f2ec",
  // A light editor theme, because the room it is sitting in is bright.
  panel: "#fdf2e2",
  panelInk: "#45210a",
  panelDim: "#b04c06",
  blending: THREE.NormalBlending,
  exposure: 1,
  ambient: 0.62,
  key: 0.5,
  // A visible shaft of light in a daylit room is a lie. Barely there.
  glow: 0.22,
  ink: 0.7,
};

export function palette(theme: SceneTheme): ScenePalette {
  return theme === "light" ? LIGHT : DARK;
}

/** Kept for the handful of places that only ever want the brand accent. */
export const COLORS = {
  amber: DARK.amber,
  ember: DARK.ember,
} as const;
