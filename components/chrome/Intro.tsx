"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ARRIVAL_LINE, HOLD_MS, LAND_MS, TYPE_MS } from "@/data/intro";
import { EASE_IN_OUT_QUINT } from "@/lib/animations/variants";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useSmoothScroll } from "./SmoothScroll";

const IntroContext = createContext<{ done: boolean }>({ done: true });

/** Sections read this to time their first entrance against the intro exit. */
export const useIntro = () => useContext(IntroContext);

const SESSION_KEY = "um:intro";

/**
 * The arrival: one line typed onto a blurred page, which then comes into
 * focus underneath it.
 *
 * The page renders the whole time, out of focus rather than withheld — that
 * is what the line is being read *against*, and it means the hero is already
 * painted when the blur comes off instead of starting from nothing.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const { stop, start } = useSmoothScroll();
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  /** How many characters of the line are down. */
  const [typed, setTyped] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("done");
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — the intro simply plays again next time */
    }
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }

    /*
     * The prologue belongs to the front door and nowhere else. Someone who
     * opens a case study or the photographs directly — from a search result,
     * a shared link, a CV — has not arrived at a portfolio, they have
     * arrived at a page, and "You are Arrived." over a case study is a
     * stranger holding the door of a room you were already in. They get the
     * page, and the session is marked seen so it cannot ambush them later.
     */
    const atFrontDoor = window.location.pathname === "/";

    // Already arrived this session, deep-linked in, or motion is switched
    // off: go straight in.
    if (seen || reduced || !atFrontDoor) {
      setPhase("done");
      if (!atFrontDoor) {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* private mode — no worse than it was */
        }
      }
      return;
    }

    setPhase("running");
    window.scrollTo(0, 0);
    stop();

    const total = ARRIVAL_LINE.length;
    // One timer per character rather than an interval: the timers array is
    // already the cancellation mechanism for skipping, and a dropped frame
    // then shortens a single gap instead of dragging the whole line late.
    for (let i = 1; i <= total; i++) {
      timers.current.push(setTimeout(() => setTyped(i), TYPE_MS * i));
    }
    timers.current.push(setTimeout(finish, TYPE_MS * total + HOLD_MS));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // `stop` is stable for the provider's lifetime; `reduced` is the real input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, finish]);

  useEffect(() => {
    if (phase === "done") start();
  }, [phase, start]);

  // Any deliberate input skips ahead. Nobody should be trapped in a prologue.
  useEffect(() => {
    if (phase !== "running") return;
    const skip = () => finish();
    const onKey = (e: KeyboardEvent) => {
      if (["Escape", "Enter", " ", "Spacebar"].includes(e.key)) skip();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", skip, { passive: true, once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", skip);
    };
  }, [phase, finish]);

  const running = phase === "running";
  const done = phase === "done";
  /* The blur holds for the whole prologue and comes off as part of the
     landing — `data-stage` drops the instant the phase ends, and its own
     900ms filter transition runs underneath the overlay's 1400ms exit, so
     the page resolves into focus while the overlay is still letting go.
     An earlier version lifted it two thirds of the way through the typing
     to save LCP, which did save LCP and also meant the line spent its last
     third sitting on top of a sharp page, reading as a caption rather than
     as something you are being shown before you arrive. */
  const blurred = running;

  return (
    <IntroContext.Provider value={{ done }}>
      <div data-stage={blurred ? "blurred" : undefined}>{children}</div>

      <AnimatePresence>
        {running ? (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[95] grid cursor-pointer place-items-center gut"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              // The landing: the overlay drifts toward the viewer and lets go
              // as the page comes up to meet it.
              opacity: 0,
              scale: 1.07,
              filter: "blur(10px)",
              transition: { duration: LAND_MS / 1000, ease: EASE_IN_OUT_QUINT },
            }}
            transition={{ duration: 0.45 }}
            onClick={finish}
            role="status"
            aria-live="polite"
          >
            {/*
              The scrim. Solid at the edges, thinnest in the middle, so the
              blurred page reads as depth behind the line rather than as a
              flat colour field. Both layers are token-driven, so this is a
              warm white in light mode without a second code path.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-void/[0.92]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(58% 58% at 50% 50%, transparent 0%, var(--color-void) 100%)",
              }}
            />

            {/* The line. Nothing else — that is the whole brief. */}
            <p className="display-serif relative text-center text-[clamp(2.25rem,7.5vw,5.75rem)] text-bone">
              <span className="u-sr">{ARRIVAL_LINE}</span>
              <span aria-hidden="true">
                {ARRIVAL_LINE.slice(0, typed)}
                {/* A block caret that blinks only once the line is down —
                    while it is typing, a blinking caret fights the letters. */}
                <span
                  className="ml-[0.08em] inline-block h-[0.72em] w-[0.055em] translate-y-[0.02em] bg-amber align-baseline"
                  style={
                    typed >= ARRIVAL_LINE.length
                      ? { animation: "caret-blink 1.1s steps(1) infinite" }
                      : undefined
                  }
                />
              </span>
            </p>

            {/* A hairline drawing itself under the line as it types. */}
            <motion.span
              aria-hidden="true"
              className="absolute bottom-[clamp(2.5rem,9vh,5rem)] h-px bg-gradient-to-r from-transparent via-amber/45 to-transparent"
              initial={{ width: 0 }}
              animate={{
                width: `${(typed / ARRIVAL_LINE.length) * 34 + 4}vw`,
              }}
              transition={{ duration: 0.4, ease: "linear" }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
