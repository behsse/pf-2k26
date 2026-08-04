"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import gsap from "gsap"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuLinks = [
  { href: "/", label: "Home", image: "/home.webp" },
  { href: "/work", label: "Work", image: "/works.webp" },
  { href: "/service", label: "Services", image: "/service.webp" },
  { href: "/faq", label: "FAQ", image: "/faq.webp" },
  { href: "/about", label: "About", image: "/about.webp" },
  { href: "/contact", label: "Contact", image: "/contact.webp" },
]

const menuImages = [...new Set(menuLinks.map(({ image }) => image))]

const isActivePath = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)

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
          <Link href="/" className="w-6">
            <img src="logo.svg" alt="Logo behsse, représente un B et un E avec un style japonais" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="flex cursor-pointer items-center gap-4 rounded-full border border-black bg-black px-6 py-2">
            <p className="text-md font-medium text-white">Réserve un appel</p>
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
  const pathname = usePathname()
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const activeLink =
    menuLinks.find(({ href }) => isActivePath(pathname, href)) ?? menuLinks[0]
  const displayedImage =
    menuLinks.find(({ href }) => href === hoveredHref)?.image ?? activeLink.image
  const [initialImage] = useState(activeLink.image)
  const currentImageRef = useRef(initialImage)
  const incomingImageRef = useRef<string | null>(null)
  const navigationImageRef = useRef<string | null>(null)
  const imageRequestIdRef = useRef(0)
  const imageZIndexRef = useRef(1)
  const imageLayerRefs = useRef(new Map<string, HTMLDivElement>())
  const imageElementRefs = useRef(new Map<string, HTMLImageElement>())
  const imageTimelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null)

  useLayoutEffect(() => {
    for (const [image, layer] of imageLayerRefs.current) {
      const isInitialImage = image === initialImage
      gsap.set(layer, {
        xPercent: isInitialImage ? 0 : -100,
        visibility: isInitialImage ? "visible" : "hidden",
        zIndex: isInitialImage ? 1 : 0,
      })
    }

    return () => {
      imageTimelineRef.current?.kill()
    }
  }, [initialImage])

  const animateToImage = useCallback(async (targetImage: string) => {
    const requestId = ++imageRequestIdRef.current

    if (navigationImageRef.current) return

    const currentImage = currentImageRef.current
    const previousIncomingImage = incomingImageRef.current

    if (targetImage === previousIncomingImage) return

    imageTimelineRef.current?.kill()

    if (previousIncomingImage) {
      const previousIncomingLayer = imageLayerRefs.current.get(previousIncomingImage)

      if (previousIncomingLayer) {
        gsap.set(previousIncomingLayer, { xPercent: -100, visibility: "hidden" })
      }

      incomingImageRef.current = null
    }

    if (targetImage === currentImage) return

    const currentLayer = imageLayerRefs.current.get(currentImage)
    const incomingLayer = imageLayerRefs.current.get(targetImage)
    const incomingImageElement = imageElementRefs.current.get(targetImage)

    if (!currentLayer || !incomingLayer || !incomingImageElement) return

    try {
      await incomingImageElement.decode()
    } catch {
      // The browser can still display an image even when decode() rejects.
    }

    if (requestId !== imageRequestIdRef.current) return

    incomingImageRef.current = targetImage
    imageZIndexRef.current += 1

    gsap.set(incomingLayer, {
      xPercent: -100,
      visibility: "visible",
      zIndex: imageZIndexRef.current,
    })

    imageTimelineRef.current = gsap.timeline({
      onComplete: () => {
        gsap.set(currentLayer, { visibility: "hidden" })
        currentImageRef.current = targetImage
        incomingImageRef.current = null
      },
    }).to(incomingLayer, {
      xPercent: 0,
      duration: 0.4,
      ease: "none",
    })
  }, [])

  const commitImage = useCallback((targetImage: string) => {
    imageRequestIdRef.current += 1
    imageTimelineRef.current?.kill()
    imageZIndexRef.current += 1

    for (const [image, layer] of imageLayerRefs.current) {
      const isTargetImage = image === targetImage

      gsap.set(layer, {
        xPercent: isTargetImage ? 0 : -100,
        visibility: isTargetImage ? "visible" : "hidden",
        zIndex: isTargetImage ? imageZIndexRef.current : 0,
      })
    }

    currentImageRef.current = targetImage
    incomingImageRef.current = null
  }, [])

  const handleMenuLinkClick = useCallback((href: string, image: string) => {
    navigationImageRef.current = image === activeLink.image ? null : image
    setHoveredHref(href)
    commitImage(image)
    onClose()
  }, [activeLink.image, commitImage, onClose])

  useLayoutEffect(() => {
    if (navigationImageRef.current === activeLink.image) {
      navigationImageRef.current = null
    }
  }, [activeLink.image])

  useEffect(() => {
    if (isOpen) navigationImageRef.current = null
  }, [isOpen])

  useLayoutEffect(() => {
    void animateToImage(displayedImage)
  }, [animateToImage, displayedImage])

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
        className={`invisible fixed inset-0 z-50 h-dvh w-screen overflow-y-auto bg-white py-6 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="flex gap-4 justify-center h-full w-full p-8">
            <div className="flex w-full justify-between items-center">
                <div className="flex flex-col gap-10 w-1/4">
                    <div className="flex flex-col gap-2">
                        <p>Informations de contact</p>
                        <div className="flex flex-col gap-2">
                            <Link href="mailto:behsse.pro@gmail.com" className="text-2xl flex gap-4">behsse.pro@gmail.com</Link>
                            <Link href="https://wa.me/33689038505" target="_blank" rel="noopener noreferrer" className="text-2xl">WhatsApp</Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Social</p>
                        <div className="flex flex-col gap-2">
                            <Link href="https://www.linkedin.com/in/sebastien-zielinski/" target="_blank" className="text-2xl">Linkedin</Link>
                            <Link href="https://www.instagram.com/behsse/" target="_blank" className="text-2xl">Instagram</Link>
                        </div>
                    </div>
                </div>
                <div className="relative h-80 w-55 shrink-0 overflow-hidden">
                    {menuImages.map((image) => (
                      <div
                        key={image}
                        ref={(layer) => {
                          if (layer) imageLayerRefs.current.set(image, layer)
                          else imageLayerRefs.current.delete(image)
                        }}
                        className={`absolute inset-0 flex items-center justify-center will-change-transform ${
                          image === initialImage ? "" : "invisible"
                        }`}
                      >
                        <img
                          ref={(element) => {
                            if (element) imageElementRefs.current.set(image, element)
                            else imageElementRefs.current.delete(image)
                          }}
                          src={image}
                          alt=""
                          loading="eager"
                          decoding="async"
                          className="h-auto w-auto max-w-none shrink-0"
                        />
                      </div>
                    ))}
                </div>
                <div
                  className="w-1/4 flex flex-col gap-4 text-4xl font-light"
                  onMouseLeave={() => setHoveredHref(null)}
                >
                    {menuLinks.map(({ href, label, image }) => {
                      const isActive = isActivePath(pathname, href)

                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => handleMenuLinkClick(href, image)}
                          onMouseEnter={() => setHoveredHref(href)}
                          onFocus={() => setHoveredHref(href)}
                          onBlur={() => setHoveredHref(null)}
                          aria-current={isActive ? "page" : undefined}
                          className={`hover:text-black ${isActive ? "text-black" : "text-gray-400"}`}
                        >
                          {label}
                        </Link>
                      )
                    })}
                </div>
            </div>
        </div>
      </div>
    </>
  )
}
