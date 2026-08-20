"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"

/** One dashed orbit.
 *
 * `size` is the circle's diameter before it is pitched, as a percentage of the
 * viewport width — no pixel ceiling, deliberately. A `min(…, 1080px)` cap was
 * what made these look small: past a 1370px viewport the cap won, so the wider
 * the monitor the smaller a share of it they covered.
 *
 * `tilt` pitches the ring away from the viewer, which is what turns the circle
 * into an ellipse — projected height lands near the width times its cosine,
 * about a sixth more once the perspective has had its say. The three tilts are
 * chosen so the orbits come out roughly as tall as each other while their
 * widths differ a lot: that is what makes them cross near the edges instead of
 * nesting like a target.
 *
 * `roll` leans the finished ellipse a couple of degrees off horizontal, `sway`
 * is how far it rocks about the vertical axis, `period` how long a
 * there-and-back takes. */
const RINGS = [
  { size: 42, tilt: 62, roll: -4, sway: 24, period: 21, opacity: 0.3 },
  { size: 60, tilt: 68, roll: 3, sway: 19, period: 29, opacity: 0.26 },
  { size: 78, tilt: 73, roll: 5, sway: 15, period: 37, opacity: 0.22 },
] as const

/** Deep enough to be nearly orthographic.
 *
 * This is the number that was wrong. At 1600px an orbit a thousand pixels wide
 * has its near edge magnified by half and its far edge shrunk by a quarter, and
 * a circle under that much foreshortening stops reading as a circle at all — it
 * warps into a ribbon. At 5000px the two edges differ by about a fifth, which
 * is enough to feel like depth and little enough to keep a clean ellipse. */
const PERSPECTIVE = 5000

/** How far the whole system leans toward the pointer, in degrees. Small on
 * purpose: past about fifteen the rings read as a spinning object rather than
 * as the room the page sits in. */
const POINTER_TILT_Y = 11
const POINTER_TILT_X = 7

/** The furniture behind the contact experience: four dashed orbits pitched away
 * from the viewer, rocking about the vertical axis at their own speeds, the
 * group leaning toward the pointer.
 *
 * They rock rather than revolve, and that is a deliberate limit rather than a
 * shortcut. A ring turning about any axis that lies in the plane of the screen
 * must pass through edge-on twice per revolution, where it collapses to a bare
 * line — the only axis that avoids it is the one pointing at the viewer, and
 * spinning about that is the pinwheel this replaced. Rocking within ±26° turns
 * about the vertical, visibly, and never reaches the degenerate angle.
 *
 * Each orbit is two nested elements. A CSS transform list applies right to
 * left, so writing the pitch and the turn on one element would spin the ring
 * about its own axis; the outer element owns the turn, in the page's frame of
 * reference, and the inner one the pitch, in its own.
 *
 * Purely decorative, so it is hidden from assistive technology and never takes
 * a pointer event. */
export function ContactBackdrop() {
  const stageRef = useRef<HTMLDivElement>(null)
  const spinnerRefs = useRef<Array<HTMLDivElement | null>>([])
  const ringRefs = useRef<Array<HTMLDivElement | null>>([])

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const spinners = spinnerRefs.current.filter((node): node is HTMLDivElement => node !== null)

    ringRefs.current.forEach((ring, index) => {
      if (!ring) return
      const { tilt, roll } = RINGS[index]
      gsap.set(ring, { rotationX: tilt, rotation: roll, transformOrigin: "50% 50%" })
    })

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const sways = spinners.map((spinner, index) => {
      const { sway, period } = RINGS[index]
      gsap.set(spinner, { rotationY: -sway, transformOrigin: "50% 50%" })
      if (reduceMotion) return null

      return gsap.to(spinner, {
        rotationY: sway,
        duration: period,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        // Starting each one part-way through its own cycle is what keeps the
        // four from swinging like a single object.
        delay: -period * (index * 0.37),
      })
    })

    if (reduceMotion) return

    // A single pointer quickTo per axis rather than a tween per move event:
    // pointermove fires far more often than the screen refreshes, and building
    // a tween for each one is how this kind of effect ends up costing more than
    // everything else on the page put together.
    const leanY = gsap.quickTo(stage, "rotationY", { duration: 0.9, ease: "power3.out" })
    const leanX = gsap.quickTo(stage, "rotationX", { duration: 0.9, ease: "power3.out" })

    const onPointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = (event.clientY / window.innerHeight) * 2 - 1
      leanY(x * POINTER_TILT_Y)
      leanX(-y * POINTER_TILT_X)
    }

    // Leaving the window should return the system to rest rather than freeze it
    // wherever the cursor happened to exit.
    const onPointerLeave = () => {
      leanY(0)
      leanX(0)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    document.addEventListener("pointerleave", onPointerLeave)

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerleave", onPointerLeave)
      for (const sway of sways) sway?.kill()
      gsap.killTweensOf(stage)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{ perspective: `${PERSPECTIVE}px` }}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Sat 4vh above the middle rather than on it. A ring pitched away from
        * the viewer has its near half — the bottom one — magnified by the
        * perspective, which drops the shape's optical centre some forty pixels
        * below the geometric one. Lifting the stage puts the orbits back around
        * the question instead of slightly under it. */}
      <div
        ref={stageRef}
        style={{ top: "calc(50% - 4vh)" }}
        className="absolute left-1/2 [transform-style:preserve-3d]"
      >
        {RINGS.map((ring, index) => (
          <div
            key={ring.size}
            ref={(element) => {
              spinnerRefs.current[index] = element
            }}
            className="absolute [transform-style:preserve-3d]"
          >
            <div
              ref={(element) => {
                ringRefs.current[index] = element
              }}
              style={{
                width: `${ring.size}vw`,
                height: `${ring.size}vw`,
                marginLeft: `${ring.size / -2}vw`,
                marginTop: `${ring.size / -2}vw`,
                borderColor: `rgba(0, 0, 0, ${ring.opacity})`,
              }}
              className="rounded-full border border-dashed"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
