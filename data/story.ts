/** Five chapters. Written as a person, not a biography. Kept deliberately short. */

export type Chapter = {
  index: string;
  title: string;
  /** The pull-quote. Short. */
  lede: string;
  /** One tight paragraph. If it needs two, it needs editing. */
  /** Factual anchor for this chapter — rendered as mono metadata. */
  marker: string;
};

export const story: Chapter[] = [
  {
    index: "01",
    title: "Curiosity",
    lede: "I wanted to know how the thing worked, not how to use it.",
    marker: "Saharanpur → VITEEE AIR 162",
  },
  {
    index: "02",
    title: "Engineering",
    lede: "Fundamentals first, because they are the part that transfers.",
    marker: "B.Tech CSE, VIT · CGPA 8.51/10",
  },
  {
    index: "03",
    title: "Building",
    lede: "Two internships, and the discovery that integration is the real problem.",
    marker: "Core Integra · 2025, 2026",
  },
  {
    index: "04",
    title: "Systems",
    lede: "Then I started building the parts nobody sees.",
    marker: "FileFinder → Energy Platform → getHired.ai",
  },
  {
    index: "05",
    title: "Next",
    lede: "Products where the engineering is the differentiator.",
    marker: "Graduating May 2027",
  },
];

export const manifesto = {
  from: "Systems",
  to: "Products",
};
