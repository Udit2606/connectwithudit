import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { Magnetic } from "./Magnetic";

type ArrowLinkProps = {
  href: string;
  children: React.ReactNode;
  /** Filled = primary action; outline = secondary. */
  variant?: "filled" | "outline" | "bare";
  external?: boolean;
  cursorLabel?: string;
  className?: string;
};

export function ArrowLink({
  href,
  children,
  variant = "outline",
  external = false,
  cursorLabel,
  className,
}: ArrowLinkProps) {
  const isHash = href.startsWith("#");
  const Comp = external || isHash ? "a" : Link;

  const content = (
    <span className="relative flex items-center gap-3 overflow-hidden">
      <span className="label relative z-10">{children}</span>
      <span
        aria-hidden="true"
        className="relative z-10 block size-3 overflow-hidden"
      >
        {/* Two arrows: one leaves, one arrives. */}
        <span className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-full group-hover:-translate-y-full">
          <Arrow external={external} />
        </span>
        <span className="absolute inset-0 -translate-x-full translate-y-full transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0 group-hover:translate-y-0">
          <Arrow external={external} />
        </span>
      </span>
    </span>
  );

  const base =
    "group relative inline-flex items-center justify-center overflow-hidden transition-colors duration-500";

  const variants = {
    filled:
      "rounded-full bg-bone px-6 py-3.5 text-void hover:bg-amber hover:text-void",
    outline:
      "rounded-full border border-line-strong px-6 py-3.5 text-bone hover:border-amber hover:text-amber",
    bare: "text-bone hover:text-amber",
  } as const;

  return (
    <Magnetic strength={variant === "bare" ? 6 : 12} className="inline-block">
      <Comp
        href={href}
        {...(external
          ? { target: "_blank", rel: "noreferrer noopener" }
          : {})}
        {...(cursorLabel ? { "data-cursor": cursorLabel } : { "data-cursor-expand": "" })}
        className={cn(base, variants[variant], className)}
      >
        {content}
      </Comp>
    </Magnetic>
  );
}

function Arrow({ external }: { external?: boolean }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-3">
      {external ? (
        <path
          d="M3 9L9 3M9 3H4.5M9 3V7.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="square"
        />
      ) : (
        <path
          d="M1 6h10M7 2l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      )}
    </svg>
  );
}
