"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { forwardRef } from "react"
import type { ComponentProps, MouseEvent } from "react"
import { navigateWithTransition } from "./pageTransition"

type TransitionLinkProps = ComponentProps<typeof Link> & { label: string }

const isInternalHref = (href: unknown): href is string =>
  typeof href === "string" && href.startsWith("/")

/** Drop-in replacement for next/link on internal routes: plays the
 * black/white stripe wipe (PageTransitionOverlay) before navigating. External
 * links, mailto/tel, modified clicks, and non-primary buttons fall through
 * to normal <Link> behavior untouched. */
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  ({ href, label, onClick, children, ...props }, ref) => {
    const router = useRouter()

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event)

      if (
        !isInternalHref(href) ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return
      }

      event.preventDefault()
      void navigateWithTransition(router, href, label)
    }

    return (
      <Link ref={ref} href={href} onClick={handleClick} {...props}>
        {children}
      </Link>
    )
  },
)

TransitionLink.displayName = "TransitionLink"
