import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Mono,
  Instrument_Serif,
  Schibsted_Grotesk,
} from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { IntroProvider } from "@/components/chrome/Intro";
import { Cursor } from "@/components/chrome/Cursor";
import { THEME_BOOTSTRAP, ThemeProvider } from "@/components/chrome/Theme";
import { RevealDriver } from "@/components/chrome/RevealDriver";
import { Nav } from "@/components/chrome/Nav";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { site } from "@/data/site";

import "./globals.css";

/**
 * Schibsted Grotesk — a Scandinavian newspaper grotesk. Chosen over the
 * usual Inter / Geist / Space Grotesk set precisely because it is not the
 * default anywhere: the single-storey 'a' alternates, the flat-sided 'o' and
 * the tight spacing read as a deliberate choice rather than a system font.
 */
const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans-family",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif-family",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

/**
 * IBM Plex Mono for technical metadata. JetBrains Mono and Geist Mono are
 * the editor defaults every generated site reaches for; Plex is a real
 * corporate type program and reads engineering-credible without that tell.
 */
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-family",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Udit Mittal",
    "Full-Stack Software Engineer",
    "Software Engineer India",
    "Next.js",
    "Spring Boot",
    "FastAPI",
    "AWS",
    "System Design",
    "VIT Vellore",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  /* A single tag, rewritten by ThemeProvider when the substrate changes.
     The media-query form would emit two, and then there is no one tag to
     keep in step with an explicit choice. */
  themeColor: "#09090b",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

/** Structured data — lets a recruiter's tooling read the facts correctly. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  url: site.url,
  address: { "@type": "PostalAddress", addressLocality: "Saharanpur", addressCountry: "IN" },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Vellore Institute of Technology",
  },
  knowsAbout: [
    "Full-Stack Development",
    "System Design",
    "Cloud Architecture",
    "Machine Learning",
    "REST API Design",
  ],
  sameAs: ["https://github.com/Udit2606", "https://linkedin.com/in/meetudit"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
      /* The theme bootstrap puts data-theme here before React hydrates, so
         the server markup and the live document legitimately differ by one
         attribute. Suppressing the warning is the supported way to say so;
         it applies to this element only, not to its subtree. */
      suppressHydrationWarning
    >
      <head>
        {/* Substrate first: this has to run before the first paint, or a
            light-mode visitor gets a black flash on every navigation. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {/* Without scripts nothing can trigger a reveal, so show it all. */}
        <noscript>
          <style>{`[data-rise],[data-rise="mask"] > span > span{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      <body className="u-grain antialiased">
        <a href="#main" className="u-skip">
          Skip to content
        </a>

        <ThemeProvider>
          <SmoothScroll>
            <IntroProvider>
              <Nav />
              <main id="main">{children}</main>
            </IntroProvider>
          </SmoothScroll>
        </ThemeProvider>

        <RevealDriver />
        <Cursor />
        <SpeedInsights />

        <script
          type="application/ld+json"
          // Static, author-controlled object — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
