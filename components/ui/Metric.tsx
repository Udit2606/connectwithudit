import { cn } from "@/lib/utils/cn";
import { Counter } from "./Counter";

type MetricProps = {
  value: string;
  label: string;
  detail?: string;
  className?: string;
  size?: "sm" | "lg";
};

export function Metric({
  value,
  label,
  detail,
  className,
  size = "lg",
}: MetricProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Counter
        value={value}
        className={cn(
          "display tabular-nums text-bone",
          size === "lg"
            ? "text-[clamp(1.75rem,3.6vw,3.25rem)]"
            : "text-[clamp(1.375rem,2.2vw,1.875rem)]",
        )}
      />
      <span className="label text-ash">{label}</span>
      {detail ? (
        <span className="max-w-[24ch] font-sans text-[0.8125rem] leading-[1.5] text-dim">
          {detail}
        </span>
      ) : null}
    </div>
  );
}
