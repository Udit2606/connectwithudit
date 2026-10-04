"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "um:theme";

/** What the <meta name="theme-color"> should say in each substrate. */
const BAR_COLOR: Record<Theme, string> = {
  dark: "#09090b",
  light: "#f5f2ec",
};

/**
 * Runs before first paint, inlined in the document head.
 *
 * It has to be blocking and it has to be duplicated logic: React cannot set
 * an attribute on <html> before hydration, and a theme applied after
 * hydration means every light-mode visitor gets a black flash first.
 *
 * Light is the default. It is not read from `prefers-color-scheme` either:
 * a fixed default means the first paint is deterministic, and the choice a
 * visitor actually makes is remembered for next time. Dark is one click
 * away in the nav and persists in localStorage once chosen.
 */
export const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)});if(t!=="light"&&t!=="dark")t="light";document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","light")}})()`;

type ThemeApi = {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeApi>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
  };
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  /*
   * Initialised to the default to match what the server rendered, then corrected
   * from the DOM on mount. The bootstrap script has already put the real
   * value on <html>, so nothing visual depends on this state settling — it
   * only exists so the toggle and the 3D layer know which way round we are.
   */
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") setThemeState(attr);
  }, []);

  const apply = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice just does not survive the tab */
    }
    // Keep the browser chrome in step with the page on mobile.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", BAR_COLOR[next]);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      const doc = document as ViewTransitionDocument;
      const smooth =
        typeof doc.startViewTransition === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!smooth) {
        apply(next);
        return;
      }

      /*
       * One root crossfade, handed to the browser. See globals.css for why
       * this is not done with CSS transitions.
       *
       * Every promise it hands back has to be caught. A transition started
       * while the document is hidden, or while another one is still
       * running — two quick clicks on the toggle — rejects `ready` and
       * `finished` with an InvalidStateError, and nothing is listening, so
       * it surfaces as an unhandled rejection in the console. The theme
       * itself still applies, because `apply` runs inside the callback.
       */
      try {
        const transition = doc.startViewTransition!(() => apply(next));
        const swallow = () => {};
        transition.ready.catch(swallow);
        transition.finished.catch(swallow);
        transition.updateCallbackDone.catch(swallow);
      } catch {
        apply(next);
      }
    },
    [apply],
  );

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [setTheme, theme],
  );

  const value = useMemo<ThemeApi>(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * The control: a disc with one half filled, rotating a half-turn on change.
 *
 * Not a sun and a moon. Those are the two most-drawn icons on the web, and
 * the thing being changed is not the time of day — it is which side of the
 * page the light is on, which a terminator line says exactly.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const light = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${light ? "dark" : "light"} appearance`}
      data-cursor-expand
      className={
        className ??
        "grid size-9 place-items-center rounded-[3px] border border-line-strong bg-void/60 text-ash backdrop-blur-md transition-colors duration-500 hover:border-amber/50 hover:text-amber"
      }
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="size-4 transition-transform duration-700 ease-[cubic-bezier(.83,0,.17,1)]"
        style={{ transform: light ? "rotate(180deg)" : "rotate(0deg)" }}
      >
        <circle
          cx="8"
          cy="8"
          r="5.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <path d="M8 2.4a5.6 5.6 0 0 0 0 11.2z" fill="currentColor" />
      </svg>
    </button>
  );
}
