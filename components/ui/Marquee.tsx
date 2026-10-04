"use client";

import { cn } from "@/lib/utils/cn";

type MarqueeProps = {
  items: readonly string[];
  duration?: number;
  reverse?: boolean;
  className?: string;
  separator?: string;
};

/**
 * Duplicated track, translated 50% — seamless without measuring anything.
 * The duplicate is aria-hidden so the content is announced exactly once.
 */
export function Marquee({
  items,
  duration = 45,
  reverse = false,
  className,
  separator = "/",
}: MarqueeProps) {
  const Track = ({ hidden }: { hidden?: boolean }) => (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={hidden ? "true" : undefined}
    >
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center">
          <span className="whitespace-nowrap px-[0.6em]">{item}</span>
          <span className="text-amber/55" aria-hidden="true">
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn("relative flex overflow-hidden", className)}
      style={
        {
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        } as React.CSSProperties
      }
    >
      <div
        className="u-marquee"
        data-reverse={reverse}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <Track />
        <Track hidden />
      </div>
    </div>
  );
}
