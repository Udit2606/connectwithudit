"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useSmoothScroll } from "@/components/chrome/SmoothScroll";
import { EXIT_AT, HAND_OVER_MS, overture, scenes } from "@/data/overture";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { Diffusion } from "./Diffusion";
import { Scene, type Pose } from "./Scene";

const IntroContext = createContext<{ done: boolean }>({ done: true });

/** Sections read this to time their first entrance against the overture. */
export const useIntro = () => useContext(IntroContext);

const SESSION_KEY = "um:intro";

/**
 * The opening sequence.
 *
 * Three scenes over seven seconds, then the site. The overlay is opaque
 * rather than a blur over the page, which matters for more than looks: an
 * earlier version held the page out of focus behind it, and Chrome will not
 * accept content behind an ancestor `filter: blur()` as a Largest
 * Contentful Paint candidate — so the hero could not register until the
 * blur came off, around 4.9s. An opaque cover does not disqualify anything
 * underneath it, so the page now paints and reports on its own schedule
 * while the overture plays on top.
 *
 * It runs once per session, only on the front door, never under reduced
 * motion, and any deliberate input ends it. Nobody should be held in a
 * prologue they did not ask for.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const { stop, start } = useSmoothScroll();
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [scene, setScene] = useState(0);
  /* "leaving" keeps the overlay mounted through its own transition; the
     site is already interactive underneath by then. */
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLeaving(true);
    timers.current.push(setTimeout(() => setPhase("done"), HAND_OVER_MS));
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — the overture simply plays again next time */
    }
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }

    /* The overture belongs to the front door. Someone opening a case study
       from a search result has arrived at a page, not at a portfolio. */
    const atFrontDoor = window.location.pathname === "/";

    if (seen || reduced || !atFrontDoor) {
      setPhase("done");
      if (!atFrontDoor) {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* no worse than it was */
        }
      }
      return;
    }

    setPhase("running");
    window.scrollTo(0, 0);
    stop();

    scenes.forEach((s, i) => {
      if (i === 0) return;
      timers.current.push(setTimeout(() => setScene(i), s.at));
    });
    timers.current.push(setTimeout(finish, EXIT_AT));

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

  useEffect(() => {
    if (phase !== "running") return;
    const skip = () => finish();
    const onKey = (e: KeyboardEvent) => {
      if (["Escape", "Enter", " ", "Spacebar"].includes(e.key)) skip();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", skip, { passive: true, once: true });
    window.addEventListener("touchstart", skip, { passive: true, once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [phase, finish]);

  const running = phase === "running";
  const poseOf = (i: number): Pose =>
    scene === i ? "present" : scene > i ? "after" : "before";

  return (
    <IntroContext.Provider value={{ done: phase === "done" }}>
      {children}

      {running ? (
        <div
          data-overture={leaving ? "leaving" : "playing"}
          aria-hidden="true"
          onClick={finish}
          className="fixed inset-0 z-[95] grid cursor-pointer place-items-center overflow-hidden bg-void gut"
        >
          <Diffusion scene={scene} />

          <div className="relative grid w-full max-w-[64rem] place-items-center text-center">
            <Scene pose={poseOf(0)}>
              <p className="display-serif text-[clamp(3.5rem,13vw,10rem)] text-bone">
                {overture.hello}
              </p>
            </Scene>

            <Scene pose={poseOf(1)}>
              <p className="font-deva text-[clamp(3.25rem,12vw,9rem)] font-light leading-[1.2] text-bone">
                {overture.namaste}
              </p>
            </Scene>
          </div>

          <span className="label absolute bottom-[clamp(1.5rem,5vh,2.75rem)] text-faint">
            Skip
          </span>
        </div>
      ) : null}
    </IntroContext.Provider>
  );
}
