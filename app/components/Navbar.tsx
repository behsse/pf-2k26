"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import gsap from "gsap"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoMark } from "./LogoMark"
import { NavFluidMask } from "./NavFluidMask"
import { TransitionLink } from "./TransitionLink"
import { ExternalLinkLabel } from "./ExternalLinkLabel"
import { getLenis } from "./lenisRegistry"
import { EMAIL, SOCIAL_LINKS, WHATSAPP_URL } from "../data/contact"

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/projets", label: "Projets" },
]

const secondaryLinks = [
  { href: "/service", label: "Services" },
  { href: "/#faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

/** Same font-weight morph as the "relief" word in the hero, but hover-driven
 * instead of auto-cycling: a hidden reference reserves the boldest weight's
 * width so the live label morphing on top never shifts the layout. */
function MorphOnHoverLabel({ label }: { label: string }) {
  return (
    <span className="relative inline-grid text-left">
      <span aria-hidden="true" className="col-start-1 row-start-1 whitespace-nowrap font-black opacity-0">
        {label}
      </span>
      <span className="col-start-1 row-start-1 whitespace-nowrap font-semibold transition-[font-weight] duration-500 ease-in-out group-hover:font-black">
        {label}
      </span>
    </span>
  )
}

const isActivePath = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLElement>(null)
  const menuTextRef = useRef<HTMLElement>(null)
  const barRefs = useRef<Array<HTMLElement | null>>([])
  const ctaButtonRef = useRef<HTMLElement>(null)
  const ctaTextRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const backdrop = backdropRef.current
    const menu = menuRef.current

    if (!backdrop || !menu) return

    gsap.set(backdrop, { opacity: 0, visibility: "hidden" })
    gsap.set(menu, { yPercent: -100, visibility: "hidden" })

    return () => {
      gsap.killTweensOf([backdrop, menu])
    }
  }, [])

  const openMenu = useCallback(() => {
    const backdrop = backdropRef.current
    const menu = menuRef.current

    if (!backdrop || !menu) return

    setIsMenuOpen(true)
    gsap.killTweensOf([backdrop, menu])
    gsap.set([backdrop, menu], { visibility: "visible" })
    gsap.to(backdrop, { opacity: 1, duration: 0.4, ease: "power2.out" })
    gsap.to(menu, { yPercent: 0, duration: 0.8, ease: "power4.inOut" })
  }, [])

  const closeMenu = useCallback(() => {
    const backdrop = backdropRef.current
    const menu = menuRef.current

    if (!backdrop || !menu) return

    setIsMenuOpen(false)
    gsap.killTweensOf([backdrop, menu])
    gsap.to(backdrop, { opacity: 0, duration: 0.4, ease: "power2.in" })
    gsap.to(menu, {
      yPercent: -100,
      duration: 0.8,
      ease: "power4.inOut",
      onComplete: () => {
        gsap.set(backdrop, { visibility: "hidden" })
        gsap.set(menu, { yPercent: -100, visibility: "hidden" })
      },
    })
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu()
    }

    document.body.style.overflow = "hidden"
    // Lenis scrolls from its own wheel listener, so overflow:hidden alone
    // would not hold the page still behind the open menu.
    getLenis()?.stop()
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      getLenis()?.start()
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [closeMenu, isMenuOpen])

  useLayoutEffect(() => {
    window.dispatchEvent(new Event("site-header-color-refresh"))

    // The hamburger bars rotate into/out of an "X" over a 300ms CSS
    // transition independent of this effect — refreshing immediately bakes
    // their mid-rotation (visually much wider) bounding box into the hover
    // reveal canvas. Rebake once more after they've settled.
    const settleTimeout = window.setTimeout(() => {
      window.dispatchEvent(new Event("site-header-color-refresh"))
    }, 320)

    return () => window.clearTimeout(settleTimeout)
  }, [isMenuOpen])

  return (
    <header
      data-site-header
      data-menu-open={isMenuOpen ? "true" : "false"}
      className="site-header fixed inset-x-0 top-0 z-60 px-4 py-5 md:px-8 md:py-6"
      style={{ color: "rgb(0, 0, 0)", "--header-contrast-color": "rgb(255, 255, 255)" } as React.CSSProperties}
    >
      <nav
        ref={navRef}
        className="relative z-60 flex items-center justify-between"
        aria-label="Navigation principale"
      >
        <div className="flex items-center gap-4">
          <TransitionLink
            ref={logoRef as React.Ref<HTMLAnchorElement>}
            href="/"
            label="Home"
            className="block w-7 text-current md:w-9"
            aria-label="Behsse — Accueil"
          >
            <LogoMark className="block h-auto w-full" />
          </TransitionLink>
        </div>
        <div className="flex items-center gap-4">
          {/* An anchor, not a button: it is a navigation, and TransitionLink
            * plays the stripe wipe on the way. NavFluidMask only reads this
            * element's rect and computed colours, so the tag change leaves the
            * hover reveal untouched. */}
          {/* data-header-cta is the handle globals.css uses to drop this pill
            * while the contact experience is running — pointing at /contact
            * from inside /contact is noise. NavFluidMask skips it on its own
            * once it is hidden, since it already guards on a zero-width rect. */}
          <TransitionLink
            ref={ctaButtonRef as React.Ref<HTMLAnchorElement>}
            href="/contact"
            label="Contact"
            data-header-cta
            className="hidden cursor-pointer items-center gap-4 rounded-full border border-current bg-current px-5 py-2 md:px-6 sm:flex"
          >
            <span
              ref={ctaTextRef as React.Ref<HTMLSpanElement>}
              className="text-md font-medium text-[var(--header-contrast-color)]"
            >
              Réserve un appel
            </span>
          </TransitionLink>
          <button
            ref={menuButtonRef as React.Ref<HTMLButtonElement>}
            type="button"
            className="flex cursor-pointer items-center gap-4 rounded-full border border-current bg-[var(--header-contrast-color)] px-5 py-2 text-current md:px-6"
            aria-controls="main-menu"
            aria-expanded={isMenuOpen}
            onClick={isMenuOpen ? closeMenu : openMenu}
          >
            <p ref={menuTextRef as React.Ref<HTMLParagraphElement>}>Menu</p>
            <div className="flex flex-col gap-1" aria-hidden="true">
              <div
                ref={(element) => {
                  barRefs.current[0] = element
                }}
                className={`h-0.5 w-4 origin-center rounded-full bg-current transition-transform duration-300 ${
                  isMenuOpen ? "translate-y-0.75 rotate-45" : ""
                }`}
              />
              <div
                ref={(element) => {
                  barRefs.current[1] = element
                }}
                className={`h-0.5 w-4 origin-center rounded-full bg-current transition-transform duration-300 ${
                  isMenuOpen ? "-translate-y-0.75 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        <NavFluidMask
          navRef={navRef}
          logoRef={logoRef}
          menuButtonRef={menuButtonRef}
          menuTextRef={menuTextRef}
          barRefs={barRefs}
          ctaButtonRef={ctaButtonRef}
          ctaTextRef={ctaTextRef}
          isMenuOpen={isMenuOpen}
        />
      </nav>

      <Menu
        backdropRef={backdropRef}
        menuRef={menuRef}
        isOpen={isMenuOpen}
        onClose={closeMenu}
      />
    </header>
  )
}

type MenuProps = {
  backdropRef: RefObject<HTMLButtonElement | null>
  menuRef: RefObject<HTMLDivElement | null>
  isOpen: boolean
  onClose: () => void
}

const Menu = ({ backdropRef, menuRef, isOpen, onClose }: MenuProps) => {
  const pathname = usePathname()

  return (
    <>
      <button
        ref={backdropRef}
        type="button"
        className={`invisible fixed inset-0 z-40 cursor-default bg-black/50 opacity-0 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-label="Fermer le menu"
        aria-hidden={!isOpen}
        onClick={onClose}
      />
      <div
        ref={menuRef}
        id="main-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`invisible fixed inset-0 z-50 h-dvh w-screen overflow-y-auto bg-white ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="flex h-full min-h-full w-full flex-col justify-between gap-16 px-4 pt-28 pb-10 md:px-8 md:pt-36 md:pb-12">
          <nav aria-label="Liens du menu" className="flex flex-col gap-2 md:gap-3">
            {[...primaryLinks, ...secondaryLinks].map(({ href, label }, index) => {
              const isActive = isActivePath(pathname, href)

              return (
                <TransitionLink
                  key={href}
                  href={href}
                  label={label}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex w-fit items-baseline gap-3 leading-[0.95] transition-colors hover:text-black md:gap-4 ${
                    isActive ? "text-black" : "text-black/40"
                  }`}
                >
                  <span className="text-xs tracking-widest md:text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-4xl tracking-[-0.03em] sm:text-5xl md:text-7xl">
                    <MorphOnHoverLabel label={label} />
                  </span>
                </TransitionLink>
              )
            })}
          </nav>

          <div className="flex gap-12 md:gap-24">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.14em] text-black/40">Informations de contact</p>
              <div className="flex flex-col gap-1">
                <Link href={`mailto:${EMAIL}`} className="group inline-flex w-fit text-lg md:text-xl">
                  <ExternalLinkLabel label={EMAIL} />
                </Link>
                <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex w-fit text-lg md:text-xl">
                  <ExternalLinkLabel label="WhatsApp" />
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.14em] text-black/40">Social</p>
              <div className="flex flex-col gap-1">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex w-fit text-lg md:text-xl"
                  >
                    <ExternalLinkLabel label={link.label} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
