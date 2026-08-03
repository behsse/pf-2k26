"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import gsap from "gsap"
import Link from "next/link"

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [closeMenu, isMenuOpen])

  return (
    <header className="relative z-60">
      <nav className="relative z-60 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <p>B</p>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="flex cursor-pointer items-center gap-4 rounded-full border border-black bg-black px-6 py-2">
            <p className="text-md font-bold capitalize text-white">Let&apos;s Talk</p>
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-4 rounded-full border border-black px-6 py-2"
            aria-controls="main-menu"
            aria-expanded={isMenuOpen}
            onClick={isMenuOpen ? closeMenu : openMenu}
          >
            <p>Menu</p>
            <div className="flex flex-col gap-1" aria-hidden="true">
              <div
                className={`h-0.5 w-4 origin-center rounded-full bg-black transition-transform duration-300 ${
                  isMenuOpen ? "translate-y-0.75 rotate-45" : ""
                }`}
              />
              <div
                className={`h-0.5 w-4 origin-center rounded-full bg-black transition-transform duration-300 ${
                  isMenuOpen ? "-translate-y-0.75 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
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
        className={`invisible fixed inset-0 z-50 h-dvh w-screen overflow-y-auto bg-red-500 py-6 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <Link href="/" onClick={onClose}>
          Home
        </Link>
      </div>
    </>
  )
}
