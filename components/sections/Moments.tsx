"use client";

import Image from "next/image";
import Link from "next/link";

import { riseDelay } from "@/components/ui/Reveal";
import { MaskText } from "@/components/ui/MaskText";
import {
  moments,
  momentsIntro,
  placeholderSpans,
  type Moment,
} from "@/data/moments";
import { site } from "@/data/site";
import { cn } from "@/lib/utils/cn";

/**
 * Grid span per frame shape.
 *
 * `tall` deliberately does *not* span two rows. It used to, and the result
 * was a frame stretched to the height of two auto-sized rows with an image
 * box inside it that kept its own 3:4 aspect ratio — up to 386px of dead
 * space under every portrait photograph. Height comes from the aspect ratio
 * alone; only width is ever spanned.
 */
const spanClass = (span: Moment["span"]) =>
  cn(
    span === "wide" && "sm:col-span-2",
    span === "full" && "col-span-full",
  );

/** Aspect per frame shape, so the layout holds before images load. */
const aspect = (span: Moment["span"]) =>
  span === "tall" ? "3 / 4" : span === "wide" ? "16 / 10" : span === "full" ? "21 / 9" : "1 / 1";

/**
 * What the browser should assume about the rendered width, per shape.
 *
 * Worth getting right: a `wide` frame is two thirds of the grid, and telling
 * the optimiser it was a third had it serving a 512px file into a 621px box.
 */
const sizesFor = (span: Moment["span"]) =>
  span === "full"
    ? "100vw"
    : span === "wide"
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 64vw"
      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw";

function Frame({ moment, i }: { moment: Moment; i: number }) {
  return (
    <figure
      data-rise="up"
      style={riseDelay(i % 3)}
      className={cn("group relative", spanClass(moment.span))}
    >
      <div
        className="relative overflow-hidden rounded-[3px] border border-line bg-ink"
        style={{ aspectRatio: aspect(moment.span) }}
      >
        <Image
          src={moment.src}
          alt={moment.alt}
          fill
          sizes={sizesFor(moment.span)}
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
        />
      </div>
      {moment.caption || moment.place ? (
        <figcaption className="mt-3 flex items-baseline justify-between gap-4">
          <span className="font-sans text-[0.9375rem] leading-[1.4] text-ash">
            {moment.caption}
          </span>
          <span className="label shrink-0 text-faint">
            {[moment.place, moment.year].filter(Boolean).join(" · ")}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Shown while `data/moments.ts` has no entries.
 *
 * Deliberately labelled as empty frames rather than filled with stock imagery
 * — the layout is real, the photographs are Udit's to add.
 */
function PlaceholderGrid() {
  return (
    <>
      <div
        data-rise="up"
        className="col-span-full mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[3px] border border-dashed border-line-strong px-5 py-4"
      >
        <span className="label text-amber">Awaiting photographs</span>
        <span className="label text-dim">
          Drop files into{" "}
          <code className="text-ash">public/moments/</code> and list them in{" "}
          <code className="text-ash">data/moments.ts</code>
        </span>
      </div>

      {placeholderSpans.map((span, i) => (
        <div
          key={i}
          data-rise="up"
          style={riseDelay(i % 3)}
          className={cn("relative", spanClass(span))}
        >
          <div
            className="relative flex items-end overflow-hidden rounded-[3px] border border-dashed border-line bg-gradient-to-br from-bone/[0.025] to-transparent p-4"
            style={{ aspectRatio: aspect(span) }}
          >
            <span className="label text-faint">
              {String(i + 1).padStart(2, "0")}
              <span className="text-faint/60">
                {" "}
                / {span ?? "square"}
              </span>
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

export function Moments() {
  const hasPhotos = moments.length > 0;

  return (
    <div className="min-h-[100svh] pb-[clamp(4rem,10vh,7rem)] pt-[clamp(6rem,14vh,9rem)]">
      <header className="gut">
        <Link
          href="/"
          data-cursor-expand
          className="group inline-flex items-center gap-3 text-ash transition-colors hover:text-amber"
        >
          <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
            <path
              d="M11 6H1M5 2L1 6l4 4"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="square"
            />
          </svg>
          <span className="label">Back to work</span>
        </Link>

        <div className="mt-[clamp(2.5rem,7vh,5rem)]">
          <span className="label text-amber">Off the record</span>
          <h1 className="mt-5">
            <MaskText
              lines={["Moments,", "kept."]}
              immediate
              className="display-serif text-[clamp(3.25rem,11vw,10rem)] text-bone"
            />
          </h1>
          <p className="mt-7 max-w-[42ch] text-lead leading-[1.5] text-ash">
            {momentsIntro.lede}
          </p>
          <p className="mt-4 max-w-[38ch] font-serif text-[1.0625rem] italic leading-[1.45] text-dim">
            {momentsIntro.note}
          </p>
          {/* Stated plainly, because the lede above says "photographs I took". */}
          <p className="mt-4 max-w-[40ch] text-[0.9375rem] leading-[1.6] text-faint">
            {momentsIntro.exception}
          </p>
        </div>
      </header>

      <div className="mt-[clamp(3rem,8vh,6rem)] gut">
        <div className="grid auto-rows-auto grid-flow-row-dense grid-cols-1 items-start gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {hasPhotos ? (
            moments.map((m, i) => <Frame key={m.src} moment={m} i={i} />)
          ) : (
            <PlaceholderGrid />
          )}
        </div>
      </div>

      {/* Close the loop back to the engineering side */}
      <div className="mt-[clamp(4rem,10vh,7rem)] border-t border-line pt-10 gut">
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <p className="max-w-[32ch] font-serif text-[clamp(1.125rem,2vw,1.625rem)] italic leading-[1.4] text-ash">
            The rest of what I build is on the other side.
          </p>
          <Link
            href="/#work"
            data-cursor="Explore"
            className="label border-b border-line-strong pb-1.5 text-bone transition-colors hover:border-amber hover:text-amber"
          >
            Selected work →
          </Link>
        </div>
        <p className="label mt-10 text-faint">
          {site.name} — {site.role}
        </p>
      </div>
    </div>
  );
}
