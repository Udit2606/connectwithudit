# Udit Mittal — Portfolio

A personal portfolio built around one idea: **from systems to products.**

The hero is a diorama: someone at a desk, late, with a graph of nodes and
edges drifting above their head and one unfinished line typing itself onto the
monitor. They breathe, their hands work, and every so often they glance over
at the second screen. Nothing in the scene follows the pointer. The diagrams in
Selected Work are the real architectures of the three projects.

A first visit opens on one line — *You are Arrived.* — typed onto a page held
out of focus, which then comes into focus underneath it.

The whole site has two substrates: a near-black room and a warm paper, both
authored rather than inverted, switchable from the nav.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Three.js / React Three Fiber · Framer Motion · Lenis

**Type:** Instrument Serif (identity) · Schibsted Grotesk (UI and body) ·
IBM Plex Mono (technical metadata)

---

## Running it

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on `:3000` |
| `npm run dev:preview` | Dev server on `:3000` writing to `.next-preview` — a second dev server can run alongside `npm run dev` only if it uses a different dist dir, since two servers sharing `.next` corrupt each other |
| `npm run build` | Production build into `.next` |
| `npm run build:prod` | Production build into `.next-prod` (safe to run while `dev` is up — the two would otherwise fight over `.next`) |
| `npm start` | Serve a production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat config) |

---

## Architecture

```
app/
  layout.tsx            fonts, metadata, JSON-LD, providers
  page.tsx              the homepage composition, in order
  work/[slug]/page.tsx  statically generated case studies
  moments/page.tsx      photography, reached from the nav rather than the scroll
components/
  chrome/               nav, cursor, theme, intro, smooth scroll, reveal driver
  sections/             one file per homepage section
  case-study/           case-study shell + the three architecture diagrams
  three/                the hero diorama (palette.ts holds both substrates)
  ui/                   shared primitives
data/                   the single source of truth for all content
lib/
  hooks/                capability detection, in-view, active section
  utils/                class joiner, damping maths
```

**All content lives in `data/`.** Nothing factual is hard-coded in a component,
so copy and metrics can be edited in one place. Every figure in `data/` comes
from the resume — there are no illustrative numbers presented as real ones.

---

## Notes on a few decisions

**The diagrams are the artwork.** There are no mock product screenshots. Each
project is drawn as the system it actually is — a convergence funnel for the
ATS ingestion pipeline, a load curve with a forecast horizon for the energy
platform, and a request path for FileFinder, where the point of the
architecture is the arc that *bypasses* the API. The energy chart is labelled
"illustrative — not plant data" on screen, because it is.

**Scroll reveals are CSS, not a library.** Framer Motion's viewport feature
(`whileInView` / `useInView`) does not activate in the version used here, so
reveals are driven by one shared `IntersectionObserver`
(`components/chrome/RevealDriver`) that flips a `data-rise-in` attribute, with
CSS transitions doing the work. One observer for the whole page is cheaper than
one per element and works inside lists without a hook per item.

Two rules came out of building it, and both are load-bearing:

- *Observe a stable element.* A hidden state that translates an element out of
  a clipping parent, or clips it to zero area, makes it invisible to its own
  observer — so the reveal can never fire. Masked text and clipped panels are
  observed via an un-clipped wrapper.
- *Fail open.* Hidden states live unconditionally in CSS with a `<noscript>`
  override, and the driver reveals everything at once if the browser has no
  `IntersectionObserver`. Content is never hidden by a missing capability.

**No GSAP.** It was in the original plan, but with Lenis handling smooth scroll
and `useScroll`/`useTransform` handling scroll-linked motion, GSAP's only
remaining job was driving a `requestAnimationFrame` loop. A plain RAF loop does
that, and dropping the dependency took the homepage's first load from 240 kB to
189 kB.

**The 3D is gated, not assumed.** `lib/hooks/useDeviceTier` checks for WebGL,
core count, memory and an explicit `Save-Data` preference. The scene mounts
only after the prologue has cleared (shader compilation would otherwise land in
the Largest Contentful Paint window), unmounts when the hero scrolls out of
view, and is replaced by a flat SVG of the same subject — same figure, same
desk, same graph, same line on the screen — on low-tier devices or when reduced
motion is requested. `effectiveType` is treated as a quality hint rather than a
veto, since it reports `slow-2g` against localhost.

**The scene does not follow the cursor.** It used to rotate toward the pointer.
That had two problems: it turned a quiet, observed moment into a toy, and it
tied the composition to wherever someone happened to leave the mouse —
including dead centre over the wordmark. The camera and the diorama now drift
on their own slow, incommensurable cycles, so the view is never quite the same
twice and never waiting to be poked. The life in the shot comes from the
subject instead: breathing, typing, the occasional glance, steam off the mug,
a signal running along the edges of the graph.

**There is no post-processing stack.** The bloom around the panel, the shaft of
light over the desk and the floor are three hand-written transparent meshes
(`components/three/Atmosphere.tsx`). `@react-three/postprocessing` would add
roughly 40 kB and a second full-screen pass for effects that, at this scale,
these produce more controllably. Both are kept deliberately faint: a cone is a
solid, and at any real opacity the viewer stops seeing lit air and starts
seeing a translucent triangle.

**Light mode is a second substrate, not an inversion.** Every colour token
keeps its *role* — `void` is always the page, `bone` is always the primary type
— so the site flips by redefining variables in `:root[data-theme="light"]` and
no component changes. Three things genuinely change rather than invert:

- *The accent.* `#ff9a3c` has about 2:1 contrast on paper, which is unusable
  for type. Light mode uses the same hue burnt down to `#b04c06` (4.8:1).
- *The grain* multiplies instead of adding, or it reads as dirt.
- *Additive blending in the 3D layer,* which is invisible on a warm white —
  adding to something already near 1.0 does nothing. On paper the motes and
  dust are drawn as dark marks with normal blending, and they shrink as well
  as dim, because a mote that reads as a soft bloom on black reads as a
  thumbprint on white.

The flip itself is handed to the View Transitions API. The obvious
alternative — a temporary `* { transition: color … }` rule — outranks the
`[data-rise]` transitions for its duration and freezes any reveal in flight.
Browsers without it simply cut.

**The prologue belongs to the front door.** It plays once per session, and only
when the first page of the session is `/`. Someone who opens a case study from
a search result has arrived at a page, not at a portfolio, and the session is
marked seen so it cannot ambush them later.

**Copy is kept short on purpose.** Everything on the homepage is one tight
paragraph or less. Case studies are allowed more room — depth is the point
there — but nothing else gets two paragraphs where one will do.

**Photography lives at `/moments`,** reached from a small aperture button in
the nav rather than as another stop on the homepage scroll, because it is a
different kind of thing. To add photographs: drop files into `public/moments/`
and list them in `data/moments.ts` (that file documents the `span` options and
why `alt` is not optional). While the list is empty the page renders labelled
placeholder frames in the real layout, rather than stock imagery standing in
for photographs that do not exist.

**Accessibility.** Semantic landmarks, a skip link, keyboard-operable layer and
pipeline controls (arrow keys step through pipeline stages), visible focus rings
for keyboard users only, exactly one `<h1>`, a labelled appearance toggle, the
prologue readable to screen readers as a whole line rather than character by
character and skippable with any key or click, and a reduced-motion path that
disables the custom cursor, magnetic hover, smooth scroll, 3D, the prologue and
every reveal.

---

## Measured

Production build, desktop, localhost:

| | |
| --- | --- |
| First Load JS (`/`) | 189 kB |
| CLS | 0 |
| LCP, repeat visit in a session | ~1.3 s |
| LCP, first visit | ~2.2 s (see below) |

Three.js is code-split and never enters the first load. Check that: a
`SCREEN_LINES` import that crossed from `data/` into `components/three/`
pulled the whole renderer back into the main bundle and took First Load from
189 kB to 436 kB, with the `dynamic()` boundary still in place and doing
nothing. Strings do not get to carry a renderer with them.

**The prologue costs first-visit LCP, and the number above is arithmetic rather
than a reading.** Chrome will not accept content behind an ancestor
`filter: blur()` as an LCP candidate, so the hero cannot register until the
blur is off: 768 ms of typing, a 520 ms hold, then a 900 ms lift ≈ 2.2 s. The
blur is the effect, so it holds for the whole line instead of lifting early.
It is paid once per session, and never by anyone who has asked for reduced
motion. The repeat-visit figure is the one measured before the prologue
changed; neither has been re-measured since, because the only browser
available here throttles `requestAnimationFrame` to ~1 fps when its pane is
not focused, which inflates every paint timing it reports. Run Lighthouse
against `npm run build:prod` for real numbers.

To drop the cost entirely, replace the blur in the `[data-stage="blurred"]`
rule in `app/globals.css` with an opacity dim — the prologue keeps its timing
and the hero becomes an LCP candidate immediately.

---

## Before deploying

- **`data/site.ts` → `url`** is a placeholder (`https://uditmittal.dev`). It
  sets `metadataBase` and the canonical/OG URLs, so point it at the real domain.
- **`public/Udit-Mittal-Resume.pdf`** was seeded from an existing resume file
  and predates getHired.ai. Replace it with the current version.
- **No Open Graph image yet.** Add `app/opengraph-image.tsx` (or a static
  `opengraph-image.png`) so shared links render a card.
