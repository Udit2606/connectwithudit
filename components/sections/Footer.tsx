"use client";

import { nav, site } from "@/data/site";
import { useSmoothScroll } from "@/components/chrome/SmoothScroll";

export function Footer() {
  const { scrollTo } = useSmoothScroll();
  const year = 2026;

  return (
    <footer className="relative border-t border-line py-10 gut">
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Identity */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-[3px] border border-line-strong font-sans text-[0.9375rem] leading-none tracking-[-0.06em] text-bone"
            >
              {site.mono}
            </span>
            <div className="flex flex-col">
              <span className="label text-bone">{site.name}</span>
              <span className="label text-dim">{site.role}</span>
            </div>
          </div>
          <p className="max-w-[28ch] font-serif text-[1.0625rem] italic leading-[1.4] text-amber">
            {site.concept}
          </p>
        </div>

        {/* Index */}
        <nav aria-label="Footer" className="lg:col-span-4">
          <span className="label mb-4 block text-dim">Index</span>
          <ul className="grid grid-cols-2 gap-y-2.5">
            {nav.map((item, i) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(item.href, -24);
                  }}
                  data-cursor-expand
                  className="label inline-flex items-baseline gap-2 text-ash transition-colors hover:text-amber"
                >
                  <span className="text-faint">0{i + 1}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Colophon */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-3 lg:col-start-10">
          <div>
            <span className="label mb-4 block text-dim">Built with</span>
            <p className="label leading-[1.8] text-ash">
              Next.js · TypeScript · Three.js · Lenis
            </p>
          </div>
          <p className="label text-faint">
            © {year} {site.name}. Designed and built from scratch.
          </p>
        </div>
      </div>
    </footer>
  );
}
