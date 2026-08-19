import type Lenis from "lenis"

let instance: Lenis | null = null

/** SmoothScroll owns the Lenis instance; this lets non-React code (the page
 * transition, which runs outside the component tree) reach it without
 * prop-drilling or a context provider. */
export function setLenis(lenis: Lenis | null) {
  instance = lenis
}

export function getLenis() {
  return instance
}
