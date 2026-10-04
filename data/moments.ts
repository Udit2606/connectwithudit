/**
 * Photography — "Moments, kept."
 *
 * ── HOW TO ADD PHOTOS ─────────────────────────────────────────────────────
 * 1. Drop image files into `public/moments/` (jpg, webp or avif; webp or
 *    avif preferred — a 2000px-wide webp is usually under 400KB).
 * 2. Add an entry below. `src` is the path under /moments.
 * 3. `span` controls how much room the frame takes in the grid:
 *      "tall"  — portrait, two rows
 *      "wide"  — landscape, two columns
 *      "full"  — a full-width moment, used sparingly
 *      omitted — a single square-ish cell
 *
 * `alt` is not optional. It is the description a screen reader reads out, and
 * what shows if the file ever fails to load — so describe the photograph, not
 * the filename.
 * ──────────────────────────────────────────────────────────────────────────
 */

export type Moment = {
  src: string;
  alt: string;
  /** Short line shown under the frame. Optional. */
  caption?: string;
  place?: string;
  year?: string;
  span?: "tall" | "wide" | "full";
};

export const momentsIntro = {
  title: "Moments, kept.",
  lede: "Photographs I took because the light was doing something, and I wanted to keep it.",
  note: "Not a portfolio. No clients, no brief, no edit beyond what the moment needed.",
};

/**
 * Thirteen photographs, ordered for the rhythm of the grid rather than
 * chronologically — a landscape to open, then an alternating run of tall and
 * square frames so no two of the same shape sit side by side.
 *
 * `place` and `year` are left off every entry on purpose. The captions
 * describe what is in the frame, which is something the photograph can be
 * checked against; where and when each was taken is not, and guessing at it
 * would be putting a caption on someone else's memory. Add them as you go —
 * the figcaption renders them as `place · year` and handles either alone.
 */
export const moments: Moment[] = [
  {
    src: "/moments/light-through-trees.webp",
    alt: "Shafts of morning sunlight breaking through a dense canopy onto a road, with figures walking through the haze below.",
    caption: "The morning the light came through in columns",
    span: "wide",
  },
  {
    src: "/moments/lightning.webp",
    alt: "A fork of lightning across a violet storm sky above a lit apartment block.",
    caption: "One frame, and the sky went purple",
    span: "tall",
  },
  {
    src: "/moments/morning-campus.webp",
    alt: "Low morning sun filtering through trees onto a lawn in front of a white building with striped awnings.",
    caption: "Eight in the morning, nobody out yet",
  },
  {
    src: "/moments/ridgeline-sunset.webp",
    alt: "The sun low in a hazy orange sky over a long ridgeline of hills, with dark treetops in the foreground.",
    caption: "Hills going flat and blue behind the haze",
    span: "wide",
  },
  {
    src: "/moments/waves-at-night.webp",
    alt: "Waves breaking white over a rocky shoreline at night under a deep blue sky with a few stars out.",
    caption: "Long enough for the spray to turn to smoke",
    span: "tall",
  },
  {
    src: "/moments/rose.webp",
    alt: "A single pink rose in full bloom against dark green foliage.",
    caption: "Still the easiest subject there is",
  },
  {
    src: "/moments/fog-street.webp",
    alt: "A wide road at night in heavy fog, streetlights receding into the distance and headlights cutting through it.",
    caption: "Winter fog, and every light grew a halo",
    span: "tall",
  },
  {
    src: "/moments/bougainvillea.webp",
    alt: "Pink and white bougainvillea bracts on a thin branch, sharp against a soft green and blue background.",
    caption: "Shot wide open until the background gave up",
    span: "wide",
  },
  {
    src: "/moments/sunset-clouds.webp",
    alt: "Orange and grey cloud layers over a skyline of low buildings and dense trees at sunset.",
    caption: "The sky did most of the work",
    span: "tall",
  },
  {
    src: "/moments/cat.webp",
    alt: "Two hands reaching down to stroke a white cat lying on tarmac scattered with yellow leaves.",
    caption: "She let us, eventually",
  },
  {
    src: "/moments/sky-lantern.webp",
    alt: "A lit paper sky lantern rising between buildings strung with blue fairy lights.",
    caption: "It got about three floors up",
    span: "tall",
  },
  {
    src: "/moments/geese.webp",
    alt: "Five white geese walking across pavement in front of an out-of-focus blue structure.",
    caption: "They had somewhere to be",
    span: "wide",
  },
  {
    src: "/moments/campus-bus.webp",
    alt: "A yellow VIT bus on a tree-lined campus road, with students walking beside a covered pathway.",
    caption: "The road everyone walks twice a day",
    span: "tall",
  },
];

/**
 * Placeholder layout, used only while `moments` is empty.
 *
 * Still here deliberately: emptying the list above — to swap the whole set
 * out, say — should show the real layout with labelled frames rather than a
 * blank page.
 */
export const placeholderSpans: (Moment["span"] | undefined)[] = [
  "wide",
  undefined,
  "tall",
  undefined,
  undefined,
  "wide",
  undefined,
  "tall",
  undefined,
];
