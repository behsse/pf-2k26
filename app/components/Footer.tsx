"use client"

import Link from "next/link"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { RevealText } from "./RevealText"
import { TransitionLink } from "./TransitionLink"
import { ExternalLinkLabel } from "./ExternalLinkLabel"
import { openCookieBanner } from "./cookieConsent"
import { EMAIL, SOCIAL_LINKS, WHATSAPP_URL } from "../data/contact"

gsap.registerPlugin(ScrollTrigger)

/** Required reading for a site collecting anything at all — even a contact
 * form puts it in scope for the GDPR. */
const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
]

/** Label shown inside the transition overlay while it covers the screen. Kept
 * short: the legal link labels themselves are far too long for it. */
const TRANSITION_LABELS: Record<string, string> = {
  "/mentions-legales": "Mentions",
  "/confidentialite": "Confidentialité",
  "/conditions-utilisation": "Conditions",
}

/** Local time in Paris, rendered only after mount. The server has no idea what
 * the clock says on the client, so rendering it during SSR guarantees a
 * hydration mismatch; an empty first paint avoids it. */
function useParisTime() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const format = () =>
      setTime(
        new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris",
        }).format(new Date()),
      )

    format()
    const id = window.setInterval(format, 30_000)
    return () => window.clearInterval(id)
  }, [])

  return time
}

/** pamidordesign.com's actual technique: the footer is `position: fixed`,
 * always sitting at the same spot in the viewport, behind everything else
 * (lower z-index than every section before it, which all have opaque
 * backgrounds). Since a fixed element takes no space in document flow, a
 * spacer of matching height is rendered in its place so the page has real
 * scroll room — as the page scrolls through that room, the flowed content
 * above runs out and slides away, revealing the fixed footer that was
 * sitting there the whole time. No sticky, no transform, no scroll math.
 *
 * That same spacer also stands in as the scroll trigger for the text
 * reveals below: the footer's own content is inside the fixed box, whose
 * position never changes with scroll, so watching it directly would fire
 * immediately on mount — long before the footer is ever visually
 * uncovered. The spacer, being in normal flow, scrolls into view at
 * exactly the right moment instead. */
export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const parisTime = useParisTime()

  useLayoutEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    const update = () => setHeight(footer.offsetHeight)
    update()

    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(footer)
    return () => resizeObserver.disconnect()
  }, [])

  // The spacer starts at zero height and only takes the footer's size once the
  // effect above has run. Child layout effects run BEFORE the parent's, so the
  // RevealText triggers pointed at this spacer measure it while it is still
  // collapsed — against a document that is a whole footer shorter. Their start
  // positions land past that document's maximum scroll and can never be
  // reached, which is why the footer's contents stayed hidden. Re-measuring
  // once the real height is in place puts them back in range.
  useLayoutEffect(() => {
    if (height === 0) return
    ScrollTrigger.refresh()
  }, [height])

  return (
    <>
      <div ref={spacerRef} style={{ height }} aria-hidden="true" />
      <footer
        ref={footerRef}
        data-footer-section
        className="fixed inset-x-0 bottom-0 z-0 bg-[#050505] px-4 py-8 text-white md:px-8 md:py-14"
      >
        {/* Everything here has to fit within ONE viewport. The footer is fixed
          * to the bottom of the screen, so any height beyond that hangs off the
          * top and can never be scrolled into view — it is simply unreachable.
          * Keep an eye on the total height when adding to it. */}
        <div className="mx-auto flex max-w-[1600px] flex-col gap-8 md:gap-14">
          <div className="flex items-start justify-between gap-6 text-xs uppercase tracking-[0.14em]">
            <p>
              <RevealText triggerElement={spacerRef}>Créons quelque chose qui marque.</RevealText>
            </p>
            <p className="whitespace-nowrap text-white/45">
              <RevealText triggerElement={spacerRef} delay={0.04}>
                PARIS <span aria-hidden="true">→</span> {parisTime}
              </RevealText>
            </p>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-[12ch] text-[2rem] leading-[0.95] tracking-[-0.04em] md:max-w-[18ch] md:text-6xl">
              <RevealText triggerElement={spacerRef} delay={0.06}>
                Prêt à créer
              </RevealText>{" "}
              <RevealText triggerElement={spacerRef} delay={0.12}>
                quelque chose de fort ?
              </RevealText>
            </h2>

            {/* Same wording as the nav CTA, on purpose: one booking action for
              * the whole site. */}
            <RevealText triggerElement={spacerRef} delay={0.2} className="md:pb-2">
              <TransitionLink
                href="/contact"
                label="Contact"
                className="inline-flex items-center gap-4 rounded-full bg-white px-6 py-3 text-md font-medium text-black transition-opacity hover:opacity-80"
              >
                Réserve un appel maintenant
              </TransitionLink>
            </RevealText>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-16">
            {/* The reference site puts its sound toggle here; the slot goes to
              * the GDPR paperwork instead, which has to be reachable from
              * every page anyway. */}
            <div className="flex flex-col gap-3 text-xs uppercase tracking-[0.14em]">
              <ul className="flex flex-col gap-1 text-white/55">
                {LEGAL_LINKS.map((link, index) => (
                  <li key={link.label}>
                    <TransitionLink
                      href={link.href}
                      label={TRANSITION_LABELS[link.href] ?? link.label}
                      className="transition-colors hover:text-white"
                    >
                      <RevealText triggerElement={spacerRef} delay={0.24 + index * 0.03}>
                        {link.label}
                      </RevealText>
                    </TransitionLink>
                  </li>
                ))}
                {/* Withdrawing consent has to be as easy as giving it
                  * (GDPR art. 7.3), so the banner stays one click away from
                  * every page. */}
                <li>
                  <button
                    type="button"
                    onClick={openCookieBanner}
                    className="cursor-pointer uppercase tracking-[0.14em] transition-colors hover:text-white"
                  >
                    <RevealText triggerElement={spacerRef} delay={0.24 + LEGAL_LINKS.length * 0.03}>
                      Cookies
                    </RevealText>
                  </button>
                </li>
              </ul>
              <p>
                <RevealText triggerElement={spacerRef} delay={0.39}>
                  © Behsse {new Date().getFullYear()}
                </RevealText>
              </p>
            </div>

            {/* Same markup and hover roll as the nav menu's contact block —
              * ExternalLinkLabel inherits its colour, so it reads on black
              * here and on white there without a variant. */}
            <div className="flex gap-12 md:gap-24">
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                  <RevealText triggerElement={spacerRef} delay={0.24}>
                    Informations de contact
                  </RevealText>
                </p>
                {/* The reveal mask wraps the roll label rather than the link
                  * itself, so the link keeps its own flex layout and the
                  * group-hover roll still resolves. */}
                <div className="flex flex-col gap-1">
                  <Link
                    href={`mailto:${EMAIL}`}
                    className="group inline-flex w-fit text-lg md:text-xl"
                  >
                    <RevealText triggerElement={spacerRef} delay={0.28}>
                      <ExternalLinkLabel label={EMAIL} />
                    </RevealText>
                  </Link>
                  <Link
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex w-fit text-lg md:text-xl"
                  >
                    <RevealText triggerElement={spacerRef} delay={0.31}>
                      <ExternalLinkLabel label="WhatsApp" />
                    </RevealText>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                  <RevealText triggerElement={spacerRef} delay={0.26}>
                    Social
                  </RevealText>
                </p>
                <div className="flex flex-col gap-1">
                  {SOCIAL_LINKS.map((link, index) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex w-fit text-lg md:text-xl"
                    >
                      <RevealText triggerElement={spacerRef} delay={0.3 + index * 0.03}>
                        <ExternalLinkLabel label={link.label} />
                      </RevealText>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
