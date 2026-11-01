/**
 * The overture. Three scenes, shown once per session, on the front door only.
 *
 *   I   Hello.                      arrival
 *   II  नमस्ते / Namaste.            the same greeting, where he is from
 *   III I'm Udit Mittal.            who is saying it
 *
 * Every timing below is the moment that scene BEGINS, measured from the
 * first frame. Scenes overlap: one is still leaving while the next arrives,
 * which is what makes the sequence read as a continuous move rather than as
 * three slides. Change these numbers and the whole piece re-times — nothing
 * else hard-codes a delay.
 */

export type Scene = {
  id: string;
  /** Milliseconds from the start of the sequence. */
  at: number;
};

export const scenes: Scene[] = [
  { id: "hello", at: 0 },
  { id: "namaste", at: 2150 },
  { id: "name", at: 4400 },
];

/** When the last scene starts to leave and the site comes forward. */
export const EXIT_AT = 7000;
/** How long the overture takes to hand over. */
export const HAND_OVER_MS = 1100;

export const overture = {
  hello: "Hello.",
  namasteDeva: "नमस्ते",
  namasteLatin: "Namaste.",
  name: "I'm Udit Mittal.",
  line: "Building things for the world of tomorrow.",
  scroll: "Scroll",
};

/**
 * One spring, used for every move in the sequence.
 *
 * Soft and slightly underdamped: things arrive with a trace of overshoot and
 * settle, which is what separates a considered entrance from a linear fade.
 * Duration-based easing was tried first and read as mechanical at this size
 * of type.
 */
export const SPRING = {
  type: "spring",
  stiffness: 58,
  damping: 18,
  mass: 1.15,
} as const;

/** A softer, slower spring for the light behind the type. */
export const SPRING_LIGHT = {
  type: "spring",
  stiffness: 26,
  damping: 22,
  mass: 1.4,
} as const;
