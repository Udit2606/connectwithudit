/**
 * The arrival sequence. Shown once per session, on the front door only.
 *
 * A blank dark screen, then one message pops in the way a new iMessage does,
 * then the page comes up behind it. Nothing else is on screen on purpose: the
 * whole point of the prologue is that there is exactly one thing to read.
 */

/** The message, as written. */
export const ARRIVAL_LINE = "You are Arrived.";

/**
 * The blank screen before the message. Long enough to register as a pause
 * rather than a slow load, short enough that nobody reaches for the back
 * button.
 */
export const LEAD_IN_MS = 700;

/** How long the message holds, from the pop, before the page takes over. */
export const HOLD_MS = 1600;

/** The landing: the dark screen letting go as the page comes into focus. */
export const LAND_MS = 900;

/*
 * A note on what this costs, because it is a real trade and not a free one.
 *
 * Chrome will not accept content behind an ancestor `filter: blur()` as a
 * Largest Contentful Paint candidate, so the hero cannot register its LCP
 * until the blur has come off: LEAD_IN + HOLD + the lift in `[data-stage]`.
 *
 * It is paid once. The sequence is stored per session, it never runs on a
 * deep link, and anyone who has asked for reduced motion never sees it.
 */
