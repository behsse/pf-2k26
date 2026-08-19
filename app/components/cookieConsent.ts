/** Consent store for the cookie banner.
 *
 * Everything here is deliberately conservative, because the rules are strict:
 *
 * - Nothing is stored, and no tracker may run, until the visitor actively
 *   picks a side. Silence, scrolling or closing the banner is NOT consent
 *   (CNIL deliberation 2020-091).
 * - Refusing has to be as easy as accepting — one click, same screen.
 * - The choice has to be reversible at any time, which is what
 *   `clearConsent` + the footer link are for.
 * - The record expires after six months, the duration the CNIL recommends
 *   for keeping a consent choice, after which the banner asks again.
 *
 * The record itself lives in localStorage, not in a cookie: it is strictly
 * necessary to honour the visitor's own choice, so it needs no consent of its
 * own, and keeping it out of the cookie jar means a refusing visitor really
 * ends up with zero cookies. */

const STORAGE_KEY = "behsse.cookie-consent"

/** Bump when the set of trackers or purposes changes: an old choice was made
 * about a different site and must not carry over silently. */
const CONSENT_VERSION = 1

const SIX_MONTHS_MS = 182 * 24 * 60 * 60 * 1000

export type ConsentValue = "granted" | "denied"

type ConsentRecord = {
  value: ConsentValue
  version: number
  /** Epoch ms, so expiry can be checked without trusting the cookie jar. */
  decidedAt: number
}

/** Fired on `window` whenever the choice changes, so trackers added later can
 * boot (or shut down) without this module having to know about them. */
export const CONSENT_EVENT = "behsse:cookie-consent"

/** Fired on `window` to bring the banner back up — used by the footer link. */
export const REOPEN_EVENT = "behsse:cookie-banner-open"

function readRecord(): ConsentRecord | null {
  if (typeof window === "undefined") return null

  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    // Private mode or storage blocked entirely: treat as "never asked". The
    // banner will reappear, which is the safe direction to fail in.
    return null
  }
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as ConsentRecord
    if (parsed.version !== CONSENT_VERSION) return null
    if (parsed.value !== "granted" && parsed.value !== "denied") return null
    if (Date.now() - parsed.decidedAt > SIX_MONTHS_MS) return null
    return parsed
  } catch {
    return null
  }
}

/** The visitor's current answer, or null if they have not answered yet (or the
 * answer has expired). Null must be treated as a refusal, never as consent. */
export function getConsent(): ConsentValue | null {
  return readRecord()?.value ?? null
}

/** True only for an explicit, still-valid "granted". This is the check any
 * future tracker should gate itself on. */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === "granted"
}

export function setConsent(value: ConsentValue) {
  const record: ConsentRecord = {
    value,
    version: CONSENT_VERSION,
    decidedAt: Date.now(),
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Storing failed — the choice still applies to this page view, it just
    // will not be remembered on the next one.
  }

  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }))
}

/** Wipes the record so the banner asks again from scratch. */
export function clearConsent() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do: if it cannot be removed it could not have been written.
  }
}

/** Subscribe to consent changes. Returns an unsubscribe function.
 *
 * When a tracker is eventually added, this is the hook it should use:
 * run on "granted", and do nothing otherwise. */
export function onConsentChange(callback: (value: ConsentValue) => void) {
  const handler = (event: Event) => callback((event as CustomEvent<ConsentValue>).detail)
  window.addEventListener(CONSENT_EVENT, handler)
  return () => window.removeEventListener(CONSENT_EVENT, handler)
}

/** Reopens the banner — the "withdraw my consent" path required by article 7.3
 * of the GDPR. */
export function openCookieBanner() {
  window.dispatchEvent(new Event(REOPEN_EVENT))
}
