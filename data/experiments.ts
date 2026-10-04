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
    body: "A figure at a lit desk, built from capsules and kept in shadow so the silhouette does the work.",
    tags: ["Three.js", "GLSL", "Lenis"],
  },
  {
    index: "L2",
    title: "Reading execution plans for fun",
    kind: "Database internals",
    body: "Writing deliberately bad joins is the fastest way to learn what an index actually costs.",
    tags: ["SQL", "Query plans", "Indexing"],
  },
  {
    index: "L3",
    title: "Single-table, on purpose",
    kind: "Data modelling",
    body: "The same access patterns, built relationally and in one table, to find where each stops being right.",
    tags: ["DynamoDB", "GSI", "Access patterns"],
  },
  {
    index: "L4",
    title: "Anomaly detection without labels",
    kind: "Applied ML",
    body: "Industrial faults are rare and unlabelled. Isolation Forest earns its place by not needing a training set.",
    tags: ["Isolation Forest", "scikit-learn", "Unsupervised"],
  },
  {
    index: "L5",
    title: "Keeping the model out of the data path",
    kind: "AI systems",
    body: "Proving an LLM-powered product can still have a reproducible database: rules write, models only read.",
    tags: ["LLM", "Determinism", "Pipelines", "PII redaction"],
  },
  {
    index: "L6",
    title: "Deep Dive in C++",
    kind: "Certification",
    body: "Templates, RAII, move semantics — the parts that make every other language make more sense.",
    tags: ["C++", "Memory model", "RAII", "Templates"],
  },
];
