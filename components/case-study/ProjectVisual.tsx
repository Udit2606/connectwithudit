"use client";

import type { Project } from "@/data/projects";
import { IngestFunnel } from "./IngestFunnel";
import { RequestPath } from "./RequestPath";
import { TelemetryPanel } from "./TelemetryPanel";

/**
 * Each project gets its own visual language, chosen because it is the honest
 * depiction of that system — a funnel, a time series, or a request path.
 * There are no mock screenshots here; the diagrams are the product.
 */
export function ProjectVisual({
  diagram,
  compact = false,
  className,
}: {
  diagram: Project["diagram"];
  compact?: boolean;
  className?: string;
}) {
  switch (diagram) {
    case "pipeline":
      return <IngestFunnel compact={compact} className={className} />;
    case "telemetry":
      return <TelemetryPanel compact={compact} className={className} />;
    case "request":
      return <RequestPath compact={compact} className={className} />;
  }
}
