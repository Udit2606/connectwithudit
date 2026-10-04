/**
 * Selected work. Three products, presented as case studies.
 * All metrics, technologies and dates are taken from the resume — no inflation.
 */

export type Metric = {
  value: string;
  label: string;
  detail?: string;
};

export type FlowKind =
  | "source"
  | "ingest"
  | "compute"
  | "model"
  | "store"
  | "client"
  | "egress";

export type FlowNode = {
  id: string;
  label: string;
  sub: string;
  kind: FlowKind;
  /** What this stage actually does — surfaced on hover/focus in the diagram. */
  detail: string;
};

export type StackGroup = {
  group: string;
  items: string[];
};

export type BuildNote = {
  title: string;
  body: string;
};

export type Project = {
  slug: string;
  index: string;
  name: string;
  /** Positioning line — what category this product sits in. */
  kicker: string;
  tagline: string;
  period: string;
  status: "Shipped" | "In progress";
  /** One paragraph a recruiter can read in six seconds. */
  summary: string;
  /** The diagram engine to render for this case study. */
  diagram: "pipeline" | "telemetry" | "request";
  metrics: Metric[];
  stack: StackGroup[];
  problem: string[];
  system: string[];
  pipeline: FlowNode[];
  build: BuildNote[];
  results: string[];
  /** Short technical claims rendered as a scannable ledger. */
  engineering: string[];
};

export const projects: Project[] = [
  /* ====================================================================== */
  {
    slug: "gethired-ai",
    index: "01",
    name: "getHired.ai",
    kicker: "AI Job-Search Copilot",
    tagline: "Every engineering role in India, normalised and coached.",
    period: "2026",
    status: "Shipped",
    diagram: "pipeline",
    summary:
      "A job-search copilot for Indian engineers. It reads roles from the five ATS platforms companies actually post to, normalises them deterministically, then scores and coaches against your resume.",
    metrics: [
      { value: "9,100+", label: "Live roles", detail: "Refreshed on a daily schedule" },
      { value: "58", label: "Companies", detail: "Tracked across their own ATS boards" },
      { value: "5", label: "ATS sources", detail: "Greenhouse, Lever, Ashby, SmartRecruiters, Workday" },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS"] },
      { group: "Data", items: ["Supabase", "PostgreSQL", "Row-Level Security"] },
      { group: "Intelligence", items: ["OpenRouter", "LLM coaching", "Heuristic fallbacks"] },
      { group: "Platform", items: ["Razorpay", "Signed webhooks", "Vercel"] },
    ],
    problem: [
      "Job boards in India are noise layered on top of the real source. Listings arrive late, duplicate across aggregators, lose their original application link, and sit next to roles that closed weeks ago.",
      "The actual signal is public — companies post to Greenhouse, Lever, Ashby, SmartRecruiters and Workday, and those systems expose structured data. Finding jobs was never the problem. Trusting them was.",
    ],
    system: [
      "It reads from the source, not the aggregators. Five ATS integrations feed a daily ingestion pipeline, and every role passes through one deterministic normalisation step before it touches the database.",
      "Deterministic matters: titles, seniority, location and work mode are collapsed by rules, not by a model, so the same input always produces the same row. The model never enters the data path — it only reads normalised records.",
      "On top sits the part that helps a candidate: resume-aware scoring, and playbooks describing how a specific company's process tends to run.",
    ],
    pipeline: [
      {
        id: "ats",
        label: "ATS Sources",
        sub: "5 integrations",
        kind: "source",
        detail:
          "Greenhouse, Lever, Ashby, SmartRecruiters and Workday. Each exposes a different shape, so each gets its own adapter.",
      },
      {
        id: "ingest",
        label: "Ingestion",
        sub: "Daily schedule",
        kind: "ingest",
        detail:
          "A scheduled refresh walks all 58 company boards, diffs against what is already stored, and only writes what changed.",
      },
      {
        id: "normalise",
        label: "Normalisation",
        sub: "Deterministic",
        kind: "compute",
        detail:
          "Rule-based collapse into one schema — title, seniority, location, work mode. No model in the data path, so results are reproducible.",
      },
      {
        id: "db",
        label: "PostgreSQL",
        sub: "RLS enforced",
        kind: "store",
        detail:
          "Supabase Postgres with row-level security. A user's resume and matches are unreachable from another user's session, enforced at the database, not the API.",
      },
      {
        id: "score",
        label: "Role Scoring",
        sub: "Resume-aware",
        kind: "model",
        detail:
          "The candidate's resume is scored against normalised role records, with heuristic fallbacks when the model is unavailable so the product degrades instead of breaking.",
      },
      {
        id: "coach",
        label: "LLM Coaching",
        sub: "PII redacted",
        kind: "model",
        detail:
          "Personal data is stripped before anything leaves the system. The model sees the shape of a candidate, never their identity.",
      },
      {
        id: "playbook",
        label: "Playbook",
        sub: "Company-aware",
        kind: "egress",
        detail:
          "Output is a concrete application plan for one company and one role, not generic advice.",
      },
    ],
    build: [
      {
        title: "Five adapters, one schema",
        body: "Each ATS has different pagination, different location encoding, and a different idea of what 'remote' means. Adapters absorb that so the rest of the system sees one shape.",
      },
      {
        title: "Keep the model out of the data path",
        body: "Normalisation is rules. Models run only in scoring and coaching, reading already-normalised records — so a bad response is a degraded feature, never corrupted data.",
      },
      {
        title: "Encrypt the resume, then forget it",
        body: "AES-GCM at rest, redacted before any outbound model call. Row-level security makes authorisation a property of the data, not a check someone can forget to write.",
      },
      {
        title: "Payments that can't be spoofed",
        body: "Razorpay subscriptions with signed webhooks. Entitlement changes originate from a verified signature, never from a client claiming it paid.",
      },
    ],
    results: [
      "9,100+ live roles across 58 companies, kept current by a daily scheduled refresh rather than manual curation.",
      "Deterministic normalisation means the same payload always produces the same row — so the pipeline is debuggable and the counts are trustworthy.",
      "Security is structural: AES-GCM encryption, PII redaction, row-level security, signed payment webhooks.",
    ],
    engineering: [
      "5 ATS integrations behind a single adapter interface",
      "Deterministic normalisation — no model in the data path",
      "AES-GCM resume encryption at rest",
      "PII redaction before every outbound model call",
      "Row-level security enforced in PostgreSQL",
      "Heuristic fallbacks for graceful model degradation",
      "Razorpay subscriptions with signature-verified webhooks",
    ],
  },

  /* ====================================================================== */
  {
    slug: "energy-optimization",
    index: "02",
    name: "Real-Time Energy Management",
    kicker: "AI-Driven Industrial Energy Intelligence",
    tagline: "Ten thousand sensor readings a minute, turned into decisions.",
    period: "Jun 2026 — Present",
    status: "In progress",
    diagram: "telemetry",
    summary:
      "An industrial energy platform. IoT telemetry over MQTT, demand forecast by an LSTM, anomalies caught by an Isolation Forest — both driving autonomous load optimisation at sub-second latency.",
    metrics: [
      { value: "10,000+", label: "Readings / minute", detail: "MQTT streaming ingestion" },
      { value: "92%", label: "Validation accuracy", detail: "LSTM forecasting + anomaly detection" },
      { value: "<1s", label: "End-to-end latency", detail: "Sensor to dashboard" },
    ],
    stack: [
      { group: "Ingestion", items: ["MQTT", "IoT", "Streaming pipeline"] },
      { group: "Services", items: ["Python", "FastAPI", "JWT auth", "14 REST endpoints"] },
      { group: "Models", items: ["LSTM", "Isolation Forest", "TensorFlow", "scikit-learn"] },
      { group: "Interface", items: ["React", "Next.js", "TypeScript", "AWS"] },
    ],
    problem: [
      "Industrial energy is expensive in a specific way: the cost is the peaks, not the total. Load spikes set tariffs, strain equipment, and are usually only visible once the bill arrives.",
      "A plant floor already produces the data needed to see them coming. What it lacks is a path from thousands of readings a minute to a decision made while the reading still matters.",
    ],
    system: [
      "Sensors publish over MQTT into a streaming ingestion layer, which fans out: telemetry to storage and the live dashboard, the same stream to the model path.",
      "An LSTM forecasts, because the signal is in the shape of the curve rather than any snapshot. An Isolation Forest runs beside it, catching readings that are individually plausible but collectively wrong.",
      "Together they drive load optimisation: the forecast says what is coming, the detector says whether to trust it. Fourteen FastAPI endpoints hold 500+ concurrent requests under load testing.",
    ],
    pipeline: [
      {
        id: "sensors",
        label: "IoT Sensors",
        sub: "10,000+ / min",
        kind: "source",
        detail:
          "Distributed meters and sensors across the plant, each publishing readings continuously rather than on request.",
      },
      {
        id: "mqtt",
        label: "MQTT Broker",
        sub: "Streaming",
        kind: "ingest",
        detail:
          "Lightweight pub/sub built for constrained devices and unreliable links. Chosen over HTTP polling because the devices should push, not be asked.",
      },
      {
        id: "pipeline",
        label: "Stream Pipeline",
        sub: "Sub-second",
        kind: "compute",
        detail:
          "Real-time ingestion and transformation. The same stream fans out to storage, to the live dashboard, and to the model path.",
      },
      {
        id: "api",
        label: "FastAPI",
        sub: "14 endpoints",
        kind: "compute",
        detail:
          "Ingestion, analytics and JWT authentication. Sustains 500+ concurrent requests in load testing.",
      },
      {
        id: "lstm",
        label: "LSTM Forecast",
        sub: "Demand curve",
        kind: "model",
        detail:
          "A sequence model, because the signal is in the shape of the load curve over time, not in any single reading.",
      },
      {
        id: "iforest",
        label: "Isolation Forest",
        sub: "Anomaly",
        kind: "model",
        detail:
          "Unsupervised outlier detection — it isolates readings that are individually plausible but wrong in context. 92% validation accuracy.",
      },
      {
        id: "optimise",
        label: "Load Optimiser",
        sub: "Autonomous",
        kind: "egress",
        detail:
          "Consumes forecast and anomaly signal together and shifts load to flatten predicted peaks.",
      },
    ],
    build: [
      {
        title: "Why MQTT and not HTTP",
        body: "At ten thousand readings a minute from constrained devices on an unreliable network, request/response is the wrong shape. MQTT lets devices push, and survives dropped links.",
      },
      {
        title: "Two models, two different jobs",
        body: "An LSTM forecasts because load is sequential. An Isolation Forest detects anomalies because labelled faults barely exist. One model for both would have done neither well.",
      },
      {
        title: "Latency as a design constraint",
        body: "A forecast that arrives after the peak is a report, not a control signal. Sub-second latency was a requirement from the start, which ruled out batch anywhere in the live path.",
      },
      {
        title: "Fan out, don't serialise",
        body: "Storage, dashboard and models consume the same stream independently. A slow model never blocks the dashboard; a reconnect never drops a model's input.",
      },
    ],
    results: [
      "10,000+ sensor readings per minute sustained, at sub-second latency to a live React/Next.js dashboard.",
      "LSTM and Isolation Forest models at 92% validation accuracy for forecasting and anomaly detection.",
      "14 FastAPI endpoints holding 500+ concurrent requests under load testing, JWT-authenticated.",
    ],
    engineering: [
      "MQTT streaming ingestion over request/response polling",
      "Fan-out stream: storage, dashboard and models decoupled",
      "LSTM demand forecasting on sequential load data",
      "Isolation Forest anomaly detection, unsupervised",
      "92% validation accuracy across both models",
      "14 FastAPI endpoints, JWT-authenticated",
      "500+ concurrent requests sustained in load testing",
    ],
  },

  /* ====================================================================== */
  {
    slug: "filefinder",
    index: "03",
    name: "FileFinder",
    kicker: "Serverless File Intelligence",
    tagline: "Zero to a thousand concurrent requests, at near-zero idle cost.",
    period: "Jan — Apr 2025",
    status: "Shipped",
    diagram: "request",
    summary:
      "A serverless file platform on Lambda, S3, DynamoDB and API Gateway. Pre-signed URLs let the browser upload straight to S3; a single-table schema keeps search in single-digit milliseconds.",
    metrics: [
      { value: "0 → 1,000+", label: "Concurrent requests", detail: "Near-zero idle cost" },
      { value: "<300ms", label: "API response", detail: "Across 4 REST endpoints" },
      { value: "50%", label: "Upload latency cut", detail: "S3 pre-signed URLs" },
    ],
    stack: [
      { group: "Frontend", items: ["React", "Next.js 14", "TypeScript", "Tailwind CSS"] },
      { group: "Compute", items: ["AWS Lambda", "API Gateway"] },
      { group: "Storage", items: ["Amazon S3", "DynamoDB", "Global secondary indexes"] },
      { group: "Scale", items: ["Single-table design", "Pre-signed URLs"] },
    ],
    problem: [
      "File management looks trivial until you look at the upload path. Routing bytes through your own API means paying for compute that only copies data, hitting payload limits, and adding a hop that makes it slower.",
      "Search has the same shape of problem: the obvious relational schema turns every lookup into a scan, and that scan grows with the table.",
    ],
    system: [
      "It is built so the expensive paths don't exist. The browser asks Lambda for a pre-signed URL, then sends bytes straight to S3 — removing the compute hop and halving upload latency.",
      "Metadata lives in a single DynamoDB table with global secondary indexes, so search is an indexed lookup rather than a scan: single-digit milliseconds over 10,000+ records, and it stays that way.",
      "Four endpoints — upload, search, download, delete — each a Lambda that scales from zero to 1,000+ concurrent and costs nothing when idle.",
    ],
    pipeline: [
      {
        id: "browser",
        label: "Browser",
        sub: "Next.js 14",
        kind: "client",
        detail:
          "A React/Next.js client that requests credentials, then uploads payloads directly to object storage — never through the API.",
      },
      {
        id: "gateway",
        label: "API Gateway",
        sub: "4 REST APIs",
        kind: "ingest",
        detail:
          "upload · search · download · delete. The single entry point for control-plane calls, and nothing else.",
      },
      {
        id: "lambda",
        label: "Lambda",
        sub: "0 → 1,000+",
        kind: "compute",
        detail:
          "Stateless handlers that scale with demand and cost nothing at rest. They mint pre-signed URLs and write metadata — they never touch file bytes.",
      },
      {
        id: "s3",
        label: "Amazon S3",
        sub: "Pre-signed",
        kind: "store",
        detail:
          "File bytes travel browser → S3 directly on a short-lived signed URL. This is the hop that was removed, and it cut upload latency 50%.",
      },
      {
        id: "dynamo",
        label: "DynamoDB",
        sub: "Single-table",
        kind: "store",
        detail:
          "One table, global secondary indexes, access patterns designed up front. Single-digit-ms search across 10,000+ records.",
      },
    ],
    build: [
      {
        title: "Take the API out of the upload path",
        body: "Lambda issues a short-lived pre-signed URL and steps aside. No compute is billed for moving bytes, payload ceilings stop applying, and upload latency halves.",
      },
      {
        title: "Design the access patterns, then the table",
        body: "DynamoDB rewards knowing your queries in advance. Modelling all four operations first meant one table with GSIs could serve them as indexed lookups instead of scans.",
      },
      {
        title: "Single-digit-ms search that stays that way",
        body: "Search hits an index, so latency is a function of result size, not table size. The same query shape works at 10,000 records and well beyond.",
      },
      {
        title: "Sub-300ms, via bundle size",
        body: "Serverless response time is dominated by cold starts, and cold starts by bundle size. Trimming the deployment artifact is what moved the endpoints under 300ms.",
      },
    ],
    results: [
      "Scales 0 → 1,000+ concurrent requests at near-zero idle cost, with no provisioned capacity between bursts.",
      "4 REST APIs at sub-300ms response times, through bundle-size optimisation.",
      "Pre-signed URLs for direct client uploads, bypassing the API layer and cutting upload latency 50%.",
      "Single-table DynamoDB schema with GSIs, enabling single-digit-ms search across 10,000+ records.",
    ],
    engineering: [
      "S3 pre-signed URLs — browser uploads bypass the API layer",
      "DynamoDB single-table design with global secondary indexes",
      "Single-digit-ms search over 10,000+ records",
      "Sub-300ms responses via bundle-size optimisation",
      "Scales 0 → 1,000+ concurrent, near-zero idle cost",
      "4 REST endpoints behind API Gateway",
    ],
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);

export const projectSlugs = projects.map((p) => p.slug);

/* ==========================================================================
   OTHER PROJECTS
   The three above are case studies: resume-backed, with a bespoke diagram
   each. These are the rest — repositories, described from what their own
   READMEs actually say and nothing else. No metric appears here that the
   repository does not state itself, which is why some of them carry fewer
   numbers than you might expect.
   ========================================================================== */

export type SideProject = {
  name: string;
  /** What category it sits in. */
  kicker: string;
  /** Two sentences at most. These are listed, not argued. */
  summary: string;
  /** Free text rather than a union: "Runs locally" is a real state. */
  status: string;
  stack: string[];
  repo: string;
  live?: string;
  /** One verifiable fact the repository states about itself. Optional. */
  note?: string;
};

export const sideProjects: SideProject[] = [
  {
    name: "Social Media Content Analyzer",
    kicker: "Document AI",
    summary:
      "Upload a PDF or an image of a post and get an engagement score, a structured critique and a platform-tailored rewrite. The AI critique sits beside deterministic text metrics computed independently, so the numbers can be checked without trusting the model.",
    status: "Deployed",
    stack: [
      "Next.js 16",
      "React 19",
      "FastAPI",
      "Python",
      "PyMuPDF",
      "Tesseract OCR",
      "Pydantic",
    ],
    repo: "https://github.com/Udit2606/social-media-content-analyzer",
    live: "https://thepostpilotai.vercel.app",
    note: "265 backend tests · OCR fallback on scanned PDFs",
  },
  {
    name: "Real-Time Market Data Pipeline",
    kicker: "Streaming systems",
    summary:
      "Live trades off a Finnhub WebSocket into Kafka, then analytics and alerting workers reading the same stream independently. Rolling-window indicators land in TimescaleDB, snapshots cache in Redis, and a FastAPI gateway relays both to a React dashboard.",
    status: "Runs locally",
    stack: [
      "Python 3.12",
      "Apache Kafka",
      "TimescaleDB",
      "Redis",
      "FastAPI",
      "React",
      "Docker Compose",
    ],
    repo: "https://github.com/Udit2606/real-time-market-data-pipeline",
    note: "Seven stages, each a separate consumer",
  },
  {
    name: "Mittal Jewellers",
    kicker: "Commerce front-end",
    summary:
      "A jewellery storefront: catalogue, cart that survives a refresh, accounts, and a dark mode built on CSS variables. Front-end only — state lives in React context and local storage rather than a backend.",
    status: "Deployed",
    stack: ["Next.js 14", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    repo: "https://github.com/Udit2606/e-commece-platform",
    live: "https://e-commece-platform.vercel.app",
  },
];
