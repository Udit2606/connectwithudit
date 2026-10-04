/** Leadership, education and the non-technical layer. All from the resume. */

export type Role = {
  index: string;
  title: string;
  org: string;
  period: string;
  /** What this actually asked of him — not the trophy, the responsibility. */
  body: string;
  stat?: { value: string; label: string };
};

export const humanIntro = {
  kicker: "Off the clock",
  title: "Engineering is a team sport before it is a technical one.",
  note: "Where I learned to stand in front of a room, run something that has to work on the day, and be accountable to people rather than a test suite.",
};

export const roles: Role[] = [
  {
    index: "01",
    title: "Head Boy",
    org: "Shemford Futuristic School",
    period: "2022 — 23",
    body: "Led the student council. Being the person who speaks is the easy half — the work is finding out what 500+ people actually want said.",
    stat: { value: "500+", label: "Students represented" },
  },
  {
    index: "02",
    title: "Event Coordinator — Guest Care",
    org: "Gravitas 2025, VIT",
    period: "2025",
    body: "Guest logistics across a three-day national festival. No ability to redeploy a fix, and a deadline that arrives whether or not you're ready.",
    stat: { value: "3 days", label: "National tech festival" },
  },
  {
    index: "03",
    title: "Bharat Scouts & Guides",
    org: "Three years",
    period: "— Nov 2022",
    body: "Three years in, selected to represent the school at a national engagement with the President of India. Where being prepared stopped being a slogan.",
    stat: { value: "Nov 2022", label: "National engagement" },
  },
  {
    index: "04",
    title: "All India Rank 162",
    org: "VITEEE",
    period: "2023",
    body: "It opened the door to VIT. It is not the most interesting thing on this page, and it shouldn't be.",
    stat: { value: "AIR 162", label: "VITEEE" },
  },
];

export type Education = {
  institution: string;
  qualification: string;
  period: string;
  location: string;
  detail?: string;
};

export const education: Education[] = [
  {
    institution: "Vellore Institute of Technology",
    qualification: "B.Tech, Computer Science and Engineering",
    period: "Aug 2023 — May 2027",
    location: "Vellore, India",
    detail: "CGPA 8.51 / 10",
  },
  {
    institution: "Shemford Futuristic School",
    qualification: "Senior Secondary (CBSE)",
    period: "Mar 2022 — May 2023",
    location: "Saharanpur, India",
  },
];

export const certification = {
  title: "C++ Programming — Deep Dive in C++",
  detail: "Beginner to advanced",
};
