/** Engineering experience. Both roles at Core Integra Global Services Pvt. Ltd. */

export type Experience = {
  index: string;
  role: string;
  company: string;
  location: string;
  period: string;
  /** What the role actually was, in one line. */
  context: string;
  built: string[];
  improved: string[];
  learned: string;
  stack: string[];
  metrics: { value: string; label: string }[];
};

export const experience: Experience[] = [
  {
    index: "01",
    role: "Software Development Intern",
    company: "Core Integra Global Services Pvt. Ltd.",
    location: "India",
    period: "May 2026 — Jun 2026",
    context: "Full-stack feature work on the Ctrl+F web application, in a six-person Agile team.",
    built: [
      "8+ full-stack features in Java, Spring Boot and React — contract to merged.",
      "REST API contracts between Spring Boot services and the React frontend.",
    ],
    improved: [
      "25+ defects resolved, cutting reported production issues 30%.",
      "Integration rework down 40% by agreeing contracts before either side was written.",
      "40+ pull requests on a feature-branch workflow, merge conflicts down 35%.",
    ],
    learned:
      "The expensive bugs were never in the code. They were in the gap between two teams' assumptions about a payload.",
    stack: ["Java", "Spring Boot", "React", "REST APIs", "Agile/Scrum", "Git"],
    metrics: [
      { value: "8+", label: "Full-stack features" },
      { value: "30%", label: "Fewer production issues" },
      { value: "40%", label: "Less integration rework" },
      { value: "40+", label: "Pull requests" },
    ],
  },
  {
    index: "02",
    role: "Summer Intern",
    company: "Core Integra Global Services Pvt. Ltd.",
    location: "India",
    period: "May 2025 — Jun 2025",
    context: "Backend engineering — API development and query performance on production services.",
    built: [
      "12 RESTful APIs in Java and Spring Boot — 5,000+ daily requests, sub-200ms.",
      "4 Spring Boot backend modules shipped to release.",
    ],
    improved: [
      "20+ SQL queries optimised: indexing, join restructuring, execution plans.",
      "Average query latency reduced from 1.2s to 300ms — a 4× improvement.",
      "30+ defects resolved, open bug backlog down 45% ahead of release.",
    ],
    learned:
      "Most of that 1.2 seconds wasn't computation. It was a join the database had no index to satisfy, doing work that didn't need to exist.",
    stack: ["Java", "Spring Boot", "MySQL", "SQL", "REST APIs", "Postman"],
    metrics: [
      { value: "12", label: "REST APIs" },
      { value: "1.2s → 300ms", label: "Query latency" },
      { value: "5,000+", label: "Daily requests" },
      { value: "45%", label: "Bug backlog cut" },
    ],
  },
];
