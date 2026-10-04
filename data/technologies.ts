/**
 * The stack, organised the way it is actually built — as layers.
 * Each technology links back to where it was genuinely used.
 */

export type Tech = {
  name: string;
  /** Real places this was used. Empty array is not permitted — omit the tech instead. */
  usedIn: string[];
};

export type Layer = {
  id: string;
  index: string;
  name: string;
  /** What this layer is responsible for. */
  role: string;
  /** How Udit thinks about this layer. First person, specific. */
  note: string;
  tech: Tech[];
};

export const layers: Layer[] = [
  {
    id: "interface",
    index: "01",
    name: "Interface",
    role: "What the user touches",
    note: "The thinnest layer in every system I've built, and it should be. Render state, send intent — no logic that belongs deeper down.",
    tech: [
      { name: "React", usedIn: ["getHired.ai", "Energy Platform", "FileFinder", "Core Integra — both internships"] },
      { name: "Next.js", usedIn: ["getHired.ai (16)", "FileFinder (14)", "Energy Platform"] },
      { name: "TypeScript", usedIn: ["getHired.ai", "Energy Platform", "FileFinder"] },
      { name: "Tailwind CSS", usedIn: ["getHired.ai", "FileFinder"] },
      { name: "HTML / CSS", usedIn: ["Every frontend I've shipped"] },
    ],
  },
  {
    id: "application",
    index: "02",
    name: "Application",
    role: "Where intent becomes a contract",
    note: "Where most integration bugs are born. I write the contract before either side exists — worth about 40% of the rework on my last internship.",
    tech: [
      { name: "REST APIs", usedIn: ["getHired.ai", "Energy Platform (14 endpoints)", "FileFinder (4 endpoints)", "Core Integra (12 APIs)"] },
      { name: "Spring Boot", usedIn: ["Core Integra — Software Development Intern", "Core Integra — Summer Intern"] },
      { name: "FastAPI", usedIn: ["Energy Platform"] },
      { name: "Microservices", usedIn: ["Core Integra — service boundaries"] },
      { name: "Java", usedIn: ["Core Integra — both internships"] },
      { name: "Python", usedIn: ["Energy Platform — services and models"] },
    ],
  },
  {
    id: "services",
    index: "03",
    name: "Services",
    role: "The work that isn't a request",
    note: "Pipelines, schedulers and models. The parts that run whether or not anyone is looking — and that make a product feel like it already knew.",
    tech: [
      { name: "AWS Lambda", usedIn: ["FileFinder", "Energy Platform"] },
      { name: "API Gateway", usedIn: ["FileFinder"] },
      { name: "MQTT streaming", usedIn: ["Energy Platform — 10,000+ readings/min"] },
      { name: "LSTM / Isolation Forest", usedIn: ["Energy Platform — 92% validation accuracy"] },
      { name: "LLM coaching (OpenRouter)", usedIn: ["getHired.ai — scoring and playbooks"] },
      { name: "Scheduled ingestion", usedIn: ["getHired.ai — daily ATS refresh"] },
    ],
  },
  {
    id: "data",
    index: "04",
    name: "Data",
    role: "The layer that outlives the code",
    note: "Schema decisions are the hardest to reverse, so they get the most thought. DynamoDB rewards knowing your queries first; Postgres rewards authorising in the database.",
    tech: [
      { name: "PostgreSQL", usedIn: ["getHired.ai — with row-level security"] },
      { name: "MySQL", usedIn: ["Core Integra — query optimisation"] },
      { name: "Amazon DynamoDB", usedIn: ["FileFinder — single-table design"] },
      { name: "Amazon S3", usedIn: ["FileFinder — pre-signed direct uploads"] },
      { name: "Query optimisation", usedIn: ["Core Integra — 1.2s → 300ms across 20+ queries"] },
      { name: "SQL", usedIn: ["Core Integra — indexing, joins, execution plans"] },
    ],
  },
  {
    id: "infrastructure",
    index: "05",
    name: "Infrastructure",
    role: "What it costs to stay running",
    note: "I care about idle cost as much as peak. FileFinder scales to a thousand concurrent requests and bills almost nothing between bursts — by design.",
    tech: [
      { name: "AWS", usedIn: ["FileFinder", "Energy Platform"] },
      { name: "Docker", usedIn: ["Local service parity"] },
      { name: "GitHub Actions", usedIn: ["CI on personal projects"] },
      { name: "Vercel", usedIn: ["getHired.ai"] },
      { name: "Supabase", usedIn: ["getHired.ai — Postgres, auth, RLS"] },
    ],
  },
];

/** Foundations — not a layer, but the reason the layers hold. */
export const foundations = {
  title: "Foundations",
  note: "Doesn't appear in a stack diagram. Decides everything anyway.",
  groups: [
    {
      label: "Computer Science",
      items: [
        "Data Structures & Algorithms",
        "Object-Oriented Programming",
        "Operating Systems",
        "Computer Networks",
      ],
    },
    {
      label: "Languages",
      items: ["C++", "Java", "Python", "C", "SQL", "TypeScript", "JavaScript"],
    },
    {
      label: "Practice",
      items: [
        "System Design",
        "Design Patterns",
        "Agile / Scrum",
        "GitHub",
        "Postman",
        "JIRA",
      ],
    },
  ],
};
