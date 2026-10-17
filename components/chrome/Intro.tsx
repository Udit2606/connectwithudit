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

import { ARRIVAL_LINE, HOLD_MS, LAND_MS, LEAD_IN_MS } from "@/data/intro";
import { EASE_IN_OUT_QUINT } from "@/lib/animations/variants";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useSmoothScroll } from "./SmoothScroll";

const IntroContext = createContext<{ done: boolean }>({ done: true });

/** Sections read this to time their first entrance against the intro exit. */
export const useIntro = () => useContext(IntroContext);

const SESSION_KEY = "um:intro";

/**
 * Runs before first paint, inlined in the document head.
 *
 * The prologue starts on a blank dark screen, but React cannot put anything
 * on screen before it hydrates, so without this the homepage would flash up
 * for a moment first. When the prologue is going to play — front door, not
 * yet seen this session, motion allowed — this marks the document so CSS can
 * hold it dark until the overlay takes over. It clears itself after a few
 * seconds regardless, so a script failure can never leave the page black.
 */
export const ARRIVAL_BOOTSTRAP = `(function(){try{if(location.pathname!=="/")return;if(sessionStorage.getItem(${JSON.stringify(
  SESSION_KEY,
)})==="1")return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.setAttribute("data-arrival","pending");setTimeout(function(){d.removeAttribute("data-arrival")},6000)}catch(e){}})()`;

/**
 * The arrival: a blank dark screen, then one message pops in the way a new
 * iMessage does, then the page comes up behind it.
 *
 * The page renders the whole time, held out of focus behind the screen, so
 * the hero is already painted when the screen lets go instead of starting
 * from nothing.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const { stop, start } = useSmoothScroll();
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  /** Whether the message has popped in yet. */
  const [popped, setPopped] = useState(false);
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

    // A beat of blank screen, the pop, a hold, then the page.
    timers.current.push(setTimeout(() => setPopped(true), LEAD_IN_MS));
    timers.current.push(setTimeout(finish, LEAD_IN_MS + HOLD_MS));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // `stop` is stable for the provider's lifetime; `reduced` is the real input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, finish]);

  useEffect(() => {
    if (phase === "done") start();
    // The pre-paint cover hands over once the overlay is on screen, or once
    // it is clear there will not be one.
    if (phase !== "idle") document.documentElement.removeAttribute("data-arrival");
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
  /* The page stays out of focus for the whole prologue and comes back as
     part of the landing — `data-stage` drops the instant the phase ends, and
     its own filter transition runs underneath the screen's exit, so the page
     resolves into focus while the dark screen is still letting go. */
  const blurred = running;

  return (
    <IntroContext.Provider value={{ done }}>
      <div data-stage={blurred ? "blurred" : undefined}>{children}</div>

      <AnimatePresence>
        {running ? (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[95] grid cursor-pointer place-items-center bg-black gut"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: LAND_MS / 1000, ease: EASE_IN_OUT_QUINT },
            }}
            onClick={finish}
            role="status"
            aria-live="polite"
          >
            <span className="u-sr">{ARRIVAL_LINE}</span>

            {/* The message. A sent bubble, popping in from its tail corner
                with a little overshoot, the way a new iMessage lands. */}
            {popped ? (
              <motion.p
                aria-hidden="true"
                className="imsg text-[clamp(1.375rem,2.8vw,2.125rem)]"
                style={{ transformOrigin: "100% 100%" }}
                initial={{ opacity: 0, scale: 0.4, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 520,
                  damping: 24,
                  mass: 0.8,
                  opacity: { duration: 0.18 },
                }}
              >
                {ARRIVAL_LINE}
              </motion.p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
