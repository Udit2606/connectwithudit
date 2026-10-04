import { cn } from "@/lib/utils/cn";
import { MaskText } from "./MaskText";

type SectionHeaderProps = {
  index: string;
  label: string;
  /** Pre-split headline lines. */
  title: readonly string[];
  lede?: string;
  className?: string;
  align?: "start" | "between";
};

/** The repeating header unit: index · label · drawn rule · headline. */
export function SectionHeader({
  index,
  label,
  title,
  lede,
  className,
  align = "start",
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex items-baseline gap-4">
        <span className="label text-amber">{index}</span>
        <span className="label text-dim">{label}</span>
        <span
          aria-hidden="true"
          data-rise="rule"
          className="u-rule mt-[-0.3em] flex-1"
        />
      </div>

      <div
        className={cn(
          "flex flex-col gap-8",
          align === "between" && "lg:flex-row lg:items-end lg:justify-between",
        )}
      >
        <MaskText
          as="h2"
          lines={title}
          className="display max-w-[22ch] text-d3 text-bone"
        />
        {lede ? (
          <p
            data-rise="up"
            style={{ "--rise-delay": "150ms" } as React.CSSProperties}
            className="max-w-[44ch] text-lead leading-[1.55] text-ash lg:text-right"
          >
            {lede}
          </p>
        ) : null}
      </div>
    </div>
  );
}
