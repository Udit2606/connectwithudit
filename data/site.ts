/**
 * Identity, contact and navigation.
 * Every fact here is drawn from Udit Mittal's resume. Nothing is invented.
 */

export const site = {
  name: "Udit Mittal",
  mono: "U/",
  role: "Full-Stack Software Engineer",
  positioning: ["AI", "Systems", "Cloud", "Products"],
  concept: "From Systems to Products",
  location: "Saharanpur, India",
  email: "meet.uditmittal@gmail.com",
  phone: "+91 96270 84571",
  url: "https://uditmittal.dev",
  tagline:
    "Software engineer building AI-powered products and cloud-native systems.",
  description:
    "Full-stack software engineer and final-year CS undergraduate at VIT. I design the systems behind production web applications — REST APIs, relational and NoSQL data models, real-time pipelines and cloud-native infrastructure.",
  meta: {
    education: ["Final year", "Computer Science", "VIT Vellore"],
    axis: "AI / Systems / Products",
  },
} as const;

export const socials = [
  { label: "GitHub", short: "GH", href: "https://github.com/Udit2606" },
  { label: "LinkedIn", short: "IN", href: "https://linkedin.com/in/meetudit" },
  { label: "Email", short: "EM", href: `mailto:${site.email}` },
] as const;

export const nav = [
  { label: "Work", href: "#work", id: "work" },
  { label: "Story", href: "#story", id: "story" },
  { label: "Systems", href: "#systems", id: "systems" },
  { label: "Experience", href: "#experience", id: "experience" },
  { label: "Beyond", href: "#human", id: "human" },
  /* "Lab", not "Experiments". Shorter — seven labels is as many as the pill
     fits at 1024px — and it stops sitting next to "Experience" looking like
     a typo of it. */
  { label: "Lab", href: "#experiments", id: "experiments" },
  { label: "Contact", href: "#contact", id: "contact" },
] as const;

/** Section register — drives the nav read-out and the scroll choreography. */
export const sections = [
  { id: "hero", index: "01", label: "Index" },
  { id: "manifesto", index: "02", label: "Manifesto" },
  { id: "story", index: "03", label: "Story" },
  { id: "work", index: "04", label: "Selected Work" },
  { id: "systems", index: "05", label: "Under the Surface" },
  { id: "experience", index: "06", label: "Experience" },
  { id: "human", index: "07", label: "Beyond Engineering" },
  { id: "experiments", index: "08", label: "Lab" },
  { id: "contact", index: "09", label: "Contact" },
] as const;
