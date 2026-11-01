/**
 * The overture. Two scenes, shown once per session, on the front door only.
 *
 *   I   Hello.     the arrival
 *   II  नमस्ते       the same greeting, in his own language
 *
 * Then the site. Each `at` is the moment that scene BEGINS, measured from
 * the first frame; scenes overlap, one still leaving as the next arrives,
 * which is what makes the pair read as one move rather than two slides.
 * Change these numbers and the whole piece re-times — nothing else
 * hard-codes a delay.
 */

export type Scene = {
  id: string;
  /** Milliseconds from the start of the sequence. */
  at: number;
};

export const scenes: Scene[] = [
  { id: "hello", at: 0 },
  { id: "namaste", at: 2000 },
];

/** When the greeting starts to leave and the site comes forward. */
export const EXIT_AT = 4300;
/** How long the overture takes to hand over. */
export const HAND_OVER_MS = 1100;

export const overture = {
  hello: "Hello.",
  namaste: "नमस्ते",
};
