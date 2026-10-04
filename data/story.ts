/** Five chapters. Written as a person, not a biography. Kept deliberately short. */

export type Chapter = {
  index: string;
  title: string;
  /** The pull-quote. Short. */
  lede: string;
  /** One tight paragraph. If it needs two, it needs editing. */
  body: string;
  /** Factual anchor for this chapter — rendered as mono metadata. */
  marker: string;
};

export const story: Chapter[] = [
  {
    index: "01",
    title: "Curiosity",
    lede: "I wanted to know how the thing worked, not how to use it.",
    marker: "Saharanpur → VITEEE AIR 162",
    body: "Saharanpur, and a kid more interested in why something broke than in what it did when it worked. The VITEEE eventually rewarded that — All India Rank 162.",
  },
  {
    index: "02",
    title: "Engineering",
    lede: "Fundamentals first, because they are the part that transfers.",
    marker: "B.Tech CSE, VIT · CGPA 8.51/10",
    body: "Data structures, algorithms, operating systems, networks — the unglamorous syllabus that turns out to be the whole job. C++ is where I learned to care what the machine is actually doing.",
  },
  {
    index: "03",
    title: "Building",
    lede: "Two internships, and the discovery that integration is the real problem.",
    marker: "Core Integra · 2025, 2026",
    body: "Backend first: 12 REST APIs, and 20+ queries taken from 1.2s to 300ms by learning to read an execution plan. Then full-stack, in a six-person Agile team.",
  },
  {
    index: "04",
    title: "Systems",
    lede: "Then I started building the parts nobody sees.",
    marker: "FileFinder → Energy Platform → getHired.ai",
    body: "FileFinder taught me the fastest path is the one you delete. The energy platform taught me about time. getHired.ai taught me to keep the model out of the data path.",
  },
  {
    index: "05",
    title: "Next",
    lede: "Products where the engineering is the differentiator.",
    marker: "Graduating May 2027",
    body: "I'm most useful where the hard part is the system — real-time data, cloud-native architecture, and AI that has to be reliable rather than impressive.",
  },
];

export const manifesto = {
  from: "Systems",
  to: "Products",
  body: "APIs, schemas, pipelines, infrastructure. The parts a user never sees, and feels in every interaction.",
  arc: ["Idea", "System", "Engineering", "Product", "Impact"],
};
