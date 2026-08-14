"use client"

import { useEffect, useRef } from "react"

const TRACK_HEIGHT = 176
const THUMB_HEIGHT = 48
const IDLE_HIDE_DELAY_MS = 1200

export function CustomScrollbar() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!wrapper || !track || !thumb) return

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotionQuery.matches) return

    const travel = TRACK_HEIGHT - THUMB_HEIGHT
    let dragging = false
    let hideTimeout = 0

    const setThumbPosition = (progress: number) => {
      thumb.style.translate = `-50% ${progress * travel}px`
    }

    const updateFromScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
      setThumbPosition(Math.min(1, Math.max(0, progress)))
    }

    const show = () => {
      wrapper.style.opacity = "1"
      window.clearTimeout(hideTimeout)
      hideTimeout = window.setTimeout(() => {
        if (!dragging) wrapper.style.opacity = "0"
      }, IDLE_HIDE_DELAY_MS)
    }

    const onScroll = () => {
      updateFromScroll()
      show()
    }

    const scrollToClientY = (clientY: number) => {
      const trackRect = track.getBoundingClientRect()
      const progress = (clientY - trackRect.top - THUMB_HEIGHT / 2) / travel
      const clamped = Math.min(1, Math.max(0, progress))
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: clamped * maxScroll })
    }

    const onThumbPointerDown = (event: PointerEvent) => {
      dragging = true
      thumb.setPointerCapture(event.pointerId)
      show()
      scrollToClientY(event.clientY)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      scrollToClientY(event.clientY)
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      thumb.releasePointerCapture(event.pointerId)
      show()
    }

    updateFromScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", updateFromScroll)
    thumb.addEventListener("pointerdown", onThumbPointerDown)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)

    return () => {
      window.clearTimeout(hideTimeout)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", updateFromScroll)
      thumb.removeEventListener("pointerdown", onThumbPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="fixed top-1/2 right-4 z-100 hidden h-44 w-1 -translate-y-1/2 opacity-0 mix-blend-exclusion transition-opacity duration-300 md:block"
    >
      <div ref={trackRef} className="absolute inset-0 rounded-full bg-white/20" />
      <div
        ref={thumbRef}
        className="absolute top-0 left-1/2 h-12 w-1 cursor-grab touch-none rounded-full bg-white transition-[scale] duration-300 ease-out will-change-transform hover:scale-x-180 active:cursor-grabbing"
      />
    </div>
  )
}
