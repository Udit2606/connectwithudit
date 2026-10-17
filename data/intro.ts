/**
 * The arrival sequence. Shown once per session, on the front door only.
 *
 * One line, typed out, centred on a page held out of focus — then the blur
 * comes off as the overlay lets go, and the page settles into place. Nothing
 * else is on screen on purpose: the whole point of the prologue is that there
 * is exactly one thing to read.
 */

/** Typed verbatim, as written. */
export const ARRIVAL_LINE = "You are Arrived.";

/**
 * A beat of nothing before the first keystroke — just the caret, blinking on
 * a page that has gone soft. A title card that starts typing the instant it
 * appears reads as a loading state; one that waits reads as deliberate.
 */
export const LEAD_IN_MS = 480;

/** How long the finished line holds before the page takes over. */
export const HOLD_MS = 1150;

/** The landing: the overlay drifting away as the page comes into focus. */
export const LAND_MS = 1800;

/* ---------------------------------------------------------------- rhythm */

/** Milliseconds per character, before any of the adjustments below. */
const BASE_MS = 112;
/** A space is the carriage moving, and it takes longer than a letter. */
const SPACE_EXTRA = 100;
/** Reaching for shift costs something. */
const SHIFT_EXTRA = 60;
/** The breath after punctuation. */
const PUNCT_EXTRA = 170;
/** How far each keystroke may stray from the base, as a fraction. */
const JITTER = 0.22;

/** Deterministic, so the prologue has the same rhythm on every load. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * When each character lands, in milliseconds from the start of the sequence.
 *
 * A fixed cadence is what makes most "typewriter" effects read as an
 * animation rather than as typing: real striking is uneven, it slows for a
 * capital, and it pauses noticeably at a word break and after a full stop.
 * This returns a cumulative schedule with all four of those built in, so the
 * line arrives with a hand behind it.
 */
export function arrivalSchedule(line: string): number[] {
  const rand = seeded(20260704);
  const at: number[] = [];
  let t = LEAD_IN_MS;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const prev = i > 0 ? line[i - 1] : "";

    let step = BASE_MS * (1 + (rand() - 0.5) * 2 * JITTER);
    if (char === " ") step += SPACE_EXTRA;
    if (char !== char.toLowerCase() && char === char.toUpperCase() && /[a-z]/i.test(char)) {
      step += SHIFT_EXTRA;
    }
    if (/[.,;:!?]/.test(prev)) step += PUNCT_EXTRA;

    t += step;
    at.push(Math.round(t));
  }

  return at;
}

/** When the last character has landed. */
export const TYPE_TOTAL_MS =
  arrivalSchedule(ARRIVAL_LINE)[ARRIVAL_LINE.length - 1];

/*
 * A note on what this costs, because it is a real trade and not a free one.
 *
 * Chrome will not accept content behind an ancestor `filter: blur()` as a
 * Largest Contentful Paint candidate, so the hero cannot register its LCP
 * until the blur has finished coming off. The blur is the effect, though —
 * it is what the line is being read *against* — so it holds for the whole
 * line, and the page pays for it. Typing at this pace, the arithmetic is
 * LEAD_IN + the schedule + HOLD + the 1200ms lift in `[data-stage]`, which
 * is a little over four and a half seconds to LCP on a first visit against
 * about 1.3s with no prologue at all.
 *
 * It is paid once. The sequence is stored per session, it never runs on a
 * deep link, and anyone who has asked for reduced motion never sees it.
 *
 * To keep the pacing and get the metric back, swap the `filter` in the
 * `[data-stage="blurred"]` rule in `app/globals.css` for an opacity dim:
 * dimmed content is still an LCP candidate, defocused content is not.
 */
