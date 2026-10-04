/**
 * The arrival sequence. Shown once per session, on first load only.
 *
 * One line, typed out, centred on a page held out of focus — then the blur
 * comes off as the overlay lets go, and the page settles into place. Nothing
 * else is on screen on purpose: the whole point of the prologue is that there
 * is exactly one thing to read.
 */

/** Typed verbatim, as written. */
export const ARRIVAL_LINE = "You are Arrived.";

/**
 * Per character. Slow enough to read as deliberate typing, fast enough that
 * the whole line is down inside a second.
 */
export const TYPE_MS = 48;

/** How long the finished line holds before the page takes over. */
export const HOLD_MS = 520;

/** The landing: the overlay drifting away as the page comes into focus. */
export const LAND_MS = 1400;

/*
 * A note on what this costs, because it is a real trade and not a free one.
 *
 * Chrome will not accept content behind an ancestor `filter: blur()` as a
 * Largest Contentful Paint candidate, so the hero cannot register its LCP
 * until the blur has finished coming off. The blur is the effect, though —
 * it is what the line is being read *against* — so it holds for the whole
 * line rather than lifting early, and the page pays for it: roughly 2.2s to
 * LCP on a first visit against about 1.3s without the prologue.
 *
 * It is paid once. The sequence is stored per session, so every later
 * navigation goes straight in at the faster number, and anyone who has asked
 * for reduced motion never sees it at all. The numbers above are as tight as
 * they can be while the typing still reads as typing.
 */
