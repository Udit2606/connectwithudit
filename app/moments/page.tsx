import type { Metadata } from "next";

import { Moments } from "@/components/sections/Moments";
import { momentsIntro } from "@/data/moments";

export const metadata: Metadata = {
  title: momentsIntro.title,
  description: momentsIntro.lede,
  alternates: { canonical: "/moments" },
  openGraph: {
    title: momentsIntro.title,
    description: momentsIntro.lede,
    type: "website",
    url: "/moments",
  },
};

export default function MomentsPage() {
  return <Moments />;
}
