import type { Metadata } from "next";

import { AllWork } from "@/components/sections/AllWork";

export const metadata: Metadata = {
  title: "All projects",
  description:
    "Every project — three case studies with the architecture written up, and the repositories alongside them.",
};

export default function WorkIndexPage() {
  return <AllWork />;
}
