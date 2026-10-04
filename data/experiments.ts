/**
 * The Lab. Deliberately informal — explorations, not products.
 * Each entry is something that genuinely exists or is genuinely being explored.
 */

export type Experiment = {
  index: string;
  title: string;
  kind: string;
  body: string;
  tags: string[];
};

export const labIntro = {
  title: "Things I built because I wanted to know if I could.",
  note: "No roadmap, no users, no pitch. Just the questions that bothered me enough to answer in code.",
};

export const experiments: Experiment[] = [
  {
    index: "L1",
    title: "This website",
    kind: "Creative engineering",
    body: "A figure at a lit desk, built from capsules and spheres and kept in shadow so the silhouette does the work. Custom GLSL for the drifting motes.",
    tags: ["Three.js", "React Three Fiber", "GLSL", "Lenis"],
  },
  {
    index: "L2",
    title: "Reading execution plans for fun",
    kind: "Database internals",
    body: "After taking 20+ production queries from 1.2s to 300ms, I kept going. Writing deliberately bad joins is the fastest way to learn what an index costs.",
    tags: ["SQL", "MySQL", "Query optimisation", "Indexing"],
  },
  {
    index: "L3",
    title: "Single-table, on purpose",
    kind: "Data modelling",
    body: "DynamoDB's single-table design feels wrong until it clicks. I built the same access patterns relationally and in one table to find where each stops being right.",
    tags: ["DynamoDB", "GSI", "Access patterns", "NoSQL"],
  },
  {
    index: "L4",
    title: "Anomaly detection without labels",
    kind: "Applied ML",
    body: "Industrial faults are rare and almost never labelled. Isolation Forest earned its place in the energy platform by not needing a training set that didn't exist.",
    tags: ["Isolation Forest", "scikit-learn", "Unsupervised"],
  },
  {
    index: "L5",
    title: "Keeping the model out of the data path",
    kind: "AI systems",
    body: "getHired.ai normalises by rules; models only ever read. The experiment was proving an LLM-powered product can still have a reproducible database.",
    tags: ["LLM", "Determinism", "Pipelines", "PII redaction"],
  },
  {
    index: "L6",
    title: "Deep Dive in C++",
    kind: "Certification",
    body: "Beginner to advanced. Templates, RAII, move semantics and the memory model — the parts that make every other language make more sense afterwards.",
    tags: ["C++", "Memory model", "RAII", "Templates"],
  },
];
