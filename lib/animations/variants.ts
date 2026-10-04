/** The site's two signature curves. Used by both CSS and JS animation. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_QUINT = [0.83, 0, 0.17, 1] as const;

/**
 * Scroll reveals are NOT defined here.
 *
 * Framer Motion's viewport feature (`whileInView`, `useInView`) does not
 * activate in this project's version — elements stay pinned in their hidden
 * state forever. Reveals are therefore owned by two pieces of our own:
 *
 *   - `data-rise="<variant>"` + `components/chrome/RevealDriver` for DOM
 *     reveals: one shared IntersectionObserver, CSS transitions, and no hook
 *     per list item. See the SCROLL REVEALS block in `app/globals.css`.
 *   - `lib/hooks/useReveal` where a JS-animated value is genuinely needed,
 *     such as SVG `pathLength` inside the architecture diagrams.
 *
 * `motion` is still used for everything it does reliably: `animate`, `exit`
 * via AnimatePresence, `layoutId`, scroll-linked `useScroll`/`useTransform`,
 * and spring-driven pointer interaction.
 */
