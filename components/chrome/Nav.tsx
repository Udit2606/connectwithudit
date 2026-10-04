"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import Link from "next/link";

import { nav, site } from "@/data/site";
import { EASE_OUT_EXPO } from "@/lib/animations/variants";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import { cn } from "@/lib/utils/cn";
import { useSmoothScroll } from "./SmoothScroll";
import { ThemeToggle, useTheme } from "./Theme";

const IDS = nav.map((n) => n.id);

/** An aperture — the photography side, stated without a camera cliché. */
function Aperture() {
  return (
    <svg viewBox="0 0 14 14" className="size-3.5" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M7 1.5 10.9 8.2M7 1.5 3.1 8.2M12.1 9.8H4.3M1.9 9.8h2.4M10.9 8.2 9.7 12.3M3.1 8.2l1.2 4.1"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Nav() {
  const { scrollTo } = useSmoothScroll();
  const { theme, toggle } = useTheme();
  const active = useActiveSection(IDS);
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * The nav retracts while reading downward and returns on any upward scroll.
   *
   * Display type runs to 14vw here, so a permanently fixed bar sits on top of
   * headlines and ledes at most scroll positions. Getting out of the way is
   * better than trying to out-contrast the content underneath.
   */
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;

    const read = () => {
      const y = window.scrollY;
      const delta = y - last;
      setCondensed(y > window.innerHeight * 0.65);

      // Ignore sub-pixel jitter and rubber-banding at the very top.
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > window.innerHeight * 0.9);
        last = y;
      }
      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Close the mobile sheet on Escape, and lock the page behind it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("lenis-stopped");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [menuOpen]);

  const go = (href: string) => {
    setMenuOpen(false);
    scrollTo(href, -24);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 gut"
        style={{
          paddingBlock: "clamp(1rem, 2.2vh, 1.75rem)",
          transform: hidden && !menuOpen ? "translateY(-115%)" : "translateY(0)",
          transition: "transform .55s var(--ease-out-expo)",
        }}
      >
        <div className="flex items-center justify-between gap-6">
          {/* Identity */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              go("#hero");
            }}
            className="group relative z-10 flex items-center gap-3"
            data-cursor-expand
            aria-label={`${site.name} — back to top`}
          >
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-[3px] border border-line-strong bg-void/60 font-sans text-[0.9375rem] leading-none tracking-[-0.06em] text-bone backdrop-blur-md transition-colors duration-500 group-hover:border-amber group-hover:text-amber"
            >
              {site.mono}
            </span>
            <AnimatePresence initial={false}>
              {!condensed ? (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  className="label hidden text-bone sm:block"
                >
                  {site.name}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </a>

          {/*
            Desktop nav.

            This appears at `lg`, not `md`. Six labels make a pill about
            580px wide, and the header is a three-item flex row with an
            identity on the left and the appearance and photography controls
            on the right — at 768px that totals ~870px inside a ~707px
            container, which pushed the right-hand cluster clean off the
            viewport. The toggle and the Moments link were unreachable for
            every tablet-width visitor. Tablets get the sheet instead, which
            lists the same sections and both controls.
          */}
          <nav
            aria-label="Sections"
            className="hidden items-center gap-1 rounded-full border border-line bg-void/55 px-1.5 py-1.5 backdrop-blur-xl lg:flex"
          >
            {nav.map((item) => {
              const isActive = active === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(item.href);
                  }}
                  aria-current={isActive ? "true" : undefined}
                  data-cursor-expand
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 transition-colors duration-300",
                    isActive ? "text-void" : "text-ash hover:text-bone",
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-bone"
                      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                    />
                  ) : null}
                  <span className="label relative">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Appearance + Moments + mobile trigger */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {/* Deliberately apart from the section nav: a different place,
                not another stop on the same scroll. */}
            <Link
              href="/moments"
              data-cursor="Moments, kept"
              className="group flex items-center gap-2.5 rounded-full border border-line bg-void/55 py-2 pl-3 pr-3.5 backdrop-blur-xl transition-colors duration-500 hover:border-amber/50"
            >
              <span className="text-dim transition-colors duration-500 group-hover:text-amber">
                <Aperture />
              </span>
              <span className="label hidden text-ash transition-colors group-hover:text-bone sm:block">
                Moments
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="relative z-10 flex size-9 items-center justify-center rounded-[3px] border border-line-strong bg-void/60 backdrop-blur-md lg:hidden"
            >
              <span className="u-sr">{menuOpen ? "Close menu" : "Open menu"}</span>
              <span aria-hidden="true" className="flex flex-col gap-[5px]">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  className="block h-px w-4 bg-bone"
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  className="block h-px w-4 bg-bone"
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet — a composition, not a shrunk desktop menu */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-nav"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink gut pb-10 pt-28 lg:hidden"
          >
            <nav aria-label="Sections" className="flex flex-col">
              {nav.map((item, i) => (
                <div key={item.id} className="overflow-hidden border-b border-line">
                  <motion.a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(item.href);
                    }}
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 0.8,
                      ease: EASE_OUT_EXPO,
                      delay: 0.08 + i * 0.05,
                    }}
                    className="flex items-baseline justify-between py-4"
                  >
                    <span className="display text-[2rem] text-bone">
                      {item.label}
                    </span>
                    <span className="label text-faint">0{i + 1}</span>
                  </motion.a>
                </div>
              ))}
            </nav>

            <div className="space-y-6">
              <Link
                href="/moments"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between gap-4 rounded-[3px] border border-line px-4 py-4"
              >
                <span className="flex items-center gap-3">
                  <span className="text-amber">
                    <Aperture />
                  </span>
                  <span className="display text-[1.375rem] text-bone">
                    Moments, kept
                  </span>
                </span>
                <span className="label text-faint">Photography</span>
              </Link>

              <button
                type="button"
                onClick={toggle}
                className="flex w-full items-center justify-between gap-4 rounded-[3px] border border-line px-4 py-4 text-left"
              >
                <span className="display text-[1.375rem] text-bone">
                  Appearance
                </span>
                <span className="label text-amber">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </button>

              <div className="space-y-4">
                <span className="label block text-dim">{site.meta.axis}</span>
                <a
                  href={`mailto:${site.email}`}
                  className="block font-sans text-[1.0625rem] text-amber"
                >
                  {site.email}
                </a>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
