"use client"

import { useLayoutEffect, useRef } from "react"
import Image, { getImageProps } from "next/image"
import type { StaticImageData } from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ABOUT_STORY, type StorySegment } from "@/app/data/aboutStory"

gsap.registerPlugin(ScrollTrigger)

/** Same values as the home page's About statement, so both texts light up at
 * an identical pace. */
const WORD_REVEAL_DURATION = 2.2
const WORD_FADE_DURATION = 0.15

/** The inline chip left in the run of text. It only ever renders at its small
 * size — the enlarged preview is a single shared element at the component root,
 * not one per thumbnail.
 *
 * That indirection is what fixes the preview appearing BEHIND the words:
 * animating each word's opacity gives every one of them its own stacking
 * context, and being later in the document they paint over any positioned
 * element sitting earlier inside the same paragraph, whatever its z-index. A
 * fixed-position element outside the text escapes that entirely. */
/** Longest side of the enlarged preview, in pixels. The optimised source is
 * resolved here rather than in the hover handler: the component knows the
 * image's real dimensions, the handler only ever sees a DOM node. */
const PREVIEW_SIZE = 480

function InlineThumb({ src, alt }: { src: StaticImageData; alt: string }) {
  const portrait = src.height >= src.width
  const previewWidth = portrait ? Math.round((PREVIEW_SIZE * src.width) / src.height) : PREVIEW_SIZE
  const previewHeight = portrait ? PREVIEW_SIZE : Math.round((PREVIEW_SIZE * src.height) / src.width)

  // getImageProps rather than a hand-built /_next/image URL: same optimiser,
  // but the query it produces is Next's business rather than something written
  // here that quietly breaks the day the loader changes.
  const previewSrc = getImageProps({ src, alt: "", width: previewWidth, height: previewHeight })
    .props.src

  // select-none and the default cursor stop the chip behaving like text:
  // without them the pointer turns into an I-beam over it and a double click
  // selects the words around it.
  //
  // Only the height is set. The width follows from the image's own proportions,
  // so a 3:4 thumbnail and a 9:16 portrait both keep their shape instead of
  // being squeezed into one box and cropped.
  return (
    <span
      data-thumb
      data-preview={previewSrc}
      className="inline-block translate-y-[0.08em] cursor-default overflow-hidden rounded-[3px] align-baseline select-none"
    >
      <Image
        src={src}
        alt={alt}
        sizes="60px"
        className="block h-[0.95em] w-auto"
      />
    </span>
  )
}

/** Splits a run of text into per-word spans. The space is a sibling of the
 * span, never inside it: an inline-block collapses trailing whitespace at its
 * own edge, which glues neighbouring words together. */
function words(value: string, keyPrefix: string) {
  const parts = value.split(" ")
  return parts.flatMap((word, index) => {
    const span = (
      <span key={`${keyPrefix}-${index}`} data-about-word className="inline-block">
        {word}
      </span>
    )
    return index < parts.length - 1 ? [span, " "] : [span]
  })
}

function renderSegment(segment: StorySegment, key: string) {
  if (segment.type === "image") {
    return <InlineThumb key={key} src={segment.src} alt={segment.alt} />
  }
  return <span key={key}>{words(segment.value, key)}</span>
}

/** The About page's centrepiece: a long statement that lights up word by word
 * as you scroll through it, with thumbnails embedded in the text. */
export function AboutStory() {
  const rootRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewImageRef = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const preview = previewRef.current
    const previewImage = previewImageRef.current
    if (!root || !preview || !previewImage) return

    let teardownPreview = () => {}

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // quickTo keeps a single tween alive and retargets it, instead of
      // spawning a new one on every mousemove — the preview eases toward the
      // cursor and keeps a little lag, rather than being pinned rigidly to it.
      const moveX = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3" })
      const moveY = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3" })

      let activeChip: HTMLElement | null = null

      const show = (chip: HTMLElement, x: number, y: number) => {
        const src = chip.dataset.preview
        if (!src) return

        activeChip = chip
        previewImage.src = src
        // The preview is pointer-events:none so it never blocks the cursor,
        // which also means clicks and drags land on the text underneath it.
        // Suppressing selection for as long as a preview is open stops the
        // reader accidentally highlighting the paragraph they are looking at.
        root.classList.add("select-none")

        // The second argument re-seeds quickTo's START value. Without it the
        // in-flight tween keeps easing from wherever the previous thumbnail
        // left the preview, so moving between two chips shows the old image
        // sliding across to the new one instead of each appearing in place.
        const rect = chip.getBoundingClientRect()
        const startX = rect.left + rect.width / 2 + (x - (rect.left + rect.width / 2)) * 0.45
        const startY = rect.top + rect.height / 2 + (y - (rect.top + rect.height / 2)) * 0.45
        moveX(startX, startX)
        moveY(startY, startY)
        gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out" })
      }

      const hide = () => {
        activeChip = null
        root.classList.remove("select-none")
        gsap.to(preview, { autoAlpha: 0, scale: 0.82, duration: 0.35, ease: "power2.out" })
      }

      // The zone around a chip that keeps its preview open, in pixels. Roughly
      // the footprint of the enlarged image, so the cursor has real room to
      // move — a chip on its own is barely 20px wide, far too small to feel any
      // follow at all.
      const HOVER_PADDING = 150
      /** How much of the cursor's offset from the chip the preview takes on.
       * Below 1 it trails the cursor instead of sitting under it. */
      const FOLLOW_RATIO = 0.45

      // Tracking lives on the document so the cursor can roam the whole zone,
      // but what keeps the preview open is its distance from the CHIP — never
      // whether it happens to be over the preview. Testing against the preview
      // is self-fulfilling: the preview moves to the cursor, so the cursor is
      // always over it, and it would trail the mouse across the entire site
      // and never close.
      const onPointerMove = (event: MouseEvent) => {
        const chip =
          (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-thumb]") ?? null

        if (chip && chip !== activeChip) {
          show(chip, event.clientX, event.clientY)
          return
        }

        if (!activeChip) return

        const rect = activeChip.getBoundingClientRect()
        const outside =
          event.clientX < rect.left - HOVER_PADDING ||
          event.clientX > rect.right + HOVER_PADDING ||
          event.clientY < rect.top - HOVER_PADDING ||
          event.clientY > rect.bottom + HOVER_PADDING

        if (outside) {
          hide()
          return
        }

        // Anchored to the chip and only partly drawn toward the cursor, so the
        // preview drifts within its zone rather than being dragged away.
        const chipX = rect.left + rect.width / 2
        const chipY = rect.top + rect.height / 2
        moveX(chipX + (event.clientX - chipX) * FOLLOW_RATIO)
        moveY(chipY + (event.clientY - chipY) * FOLLOW_RATIO)
      }

      gsap.set(preview, { autoAlpha: 0, scale: 0.82, xPercent: -50, yPercent: -50 })

      document.addEventListener("mousemove", onPointerMove)
      window.addEventListener("scroll", hide, { passive: true })

      teardownPreview = () => {
        document.removeEventListener("mousemove", onPointerMove)
        window.removeEventListener("scroll", hide)
        root.classList.remove("select-none")
      }
    }

    const wordEls = gsap.utils.toArray<HTMLElement>("[data-about-word]", root)
    if (wordEls.length === 0) return teardownPreview

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(wordEls, { opacity: 1 })
      return teardownPreview
    }

    const context = gsap.context(() => {
      // Matched to the home page's About statement: same 0.2 resting opacity,
      // same short per-word fade, and the same `stagger: { amount }` — which
      // spreads ALL the words across one fixed span rather than adding a fixed
      // gap between each. A per-word stagger makes the reveal's length depend
      // on how many words there are, so a longer text crawls; the amount form
      // keeps the pacing identical whatever the length.
      gsap.set(wordEls, { opacity: 0.2, willChange: "opacity" })

      gsap.to(wordEls, {
        opacity: 1,
        ease: "none",
        duration: WORD_FADE_DURATION,
        stagger: { amount: WORD_REVEAL_DURATION - WORD_FADE_DURATION },
        scrollTrigger: {
          trigger: root,
          // Starts as the block reaches the lower third of the screen and runs
          // until it clears the upper third, so the reveal tracks the reader
          // rather than being over before they arrive.
          start: "top 70%",
          end: "bottom 35%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
    }, root)

    return () => {
      teardownPreview()
      context.revert()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="mx-auto flex max-w-4xl flex-col gap-8 text-2xl leading-[1.45] font-medium tracking-[-0.02em] md:gap-10 md:text-[2rem]"
    >
      {ABOUT_STORY.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}>
          {paragraph.flatMap((segment, segmentIndex) => {
            const node = renderSegment(segment, `${paragraphIndex}-${segmentIndex}`)
            // Images sit between words, so they need their own spacing — the
            // surrounding text segments carry no trailing space of their own.
            return segmentIndex < paragraph.length - 1 ? [node, " "] : [node]
          })}
        </p>
      ))}

      {/* One shared preview for every thumbnail, fixed to the viewport and
        * outside the text. Being fixed puts it in the page's top stacking
        * layer, so the animated words can no longer paint over it.
        *
        * Height only, and no object-fit. The box was 17rem by 13rem — landscape
        * — while every image in the story is a portrait, so `object-cover` was
        * throwing away close to half of each one. Letting the width follow the
        * image means the frame changes shape with whatever is inside it. */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 h-[17rem] w-auto overflow-hidden rounded-[4px] opacity-0 will-change-transform"
      >
        {/* A plain img: the source is swapped imperatively on hover, which
          * next/image's managed src does not allow. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={previewImageRef} alt="" className="block h-full w-auto" />
      </div>
    </div>
  )
}
