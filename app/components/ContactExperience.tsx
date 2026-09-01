"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import { MorphText } from "./MorphText"
import { ContactStepper } from "./ContactStepper"
import { ContactBackdrop } from "./ContactBackdrop"
import { RevealText } from "./RevealText"
import { TransitionLink } from "./TransitionLink"
import { CONTACT_BRANCHES, findBranch } from "../data/contactFlow"
import type { ContactStep } from "../data/contactFlow"
import { EMAIL, SOCIAL_LINKS } from "../data/contact"
import {
  describeAnswers,
  firstNameFrom,
  isStepEmpty,
  validateStep,
} from "../lib/contactSubmission"
import type { ContactAnswers } from "../lib/contactSubmission"

type Phase = "hub" | "flow" | "recap" | "sent"

/** Everything needed to draw one screen. The crossfade renders two of these at
 * once, so a screen has to be reconstructible from data alone rather than from
 * whatever the component happens to be showing. */
type Screen = { phase: Phase; stepIndex: number; branchId: string | null }

const HUB_QUESTION = "Qu'est-ce qui t'amène ?"
const RECAP_QUESTION = "On relit avant d'envoyer ?"

/** How long the "Email copié" confirmation stays on the button. */
const COPIED_MS = 2200

const PANEL_OUT = 0.2
const PANEL_IN = 0.3

/** How long the answer area takes to grow or shrink to its new content. */
const PANEL_RESIZE = 0.34

/** Primary action — the site's own pill, same as the header's "Réserve un
 * appel". */
const PRIMARY_CLASS =
  "cursor-pointer rounded-full border border-black bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-black/85 md:px-6"

/** Secondary action: the same pill, drawn rather than filled. */
const SECONDARY_CLASS =
  "cursor-pointer rounded-full border border-black/20 px-5 py-2 text-sm text-black/60 transition-colors hover:border-black/60 hover:text-black md:px-6"

/** The contact page, as a conversation rather than a form.
 *
 * One question sits at a fixed height on an otherwise empty screen and turns
 * into the next one in place (see `MorphText`), with the answer directly
 * underneath and the controls at the foot. Three ways in — a full project
 * brief, a phone slot, or just the address copied to the clipboard — because
 * the person who wants to send one line should not have to walk through six
 * questions.
 *
 * Nothing leaves the browser until `Envoyer` on the recap. */
export function ContactExperience() {
  const [phase, setPhase] = useState<Phase>("hub")
  const [branchId, setBranchId] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<ContactAnswers>({})
  const [status, setStatus] = useState<"idle" | "sending" | "failed">("idle")
  const [failureMessage, setFailureMessage] = useState("")
  const [copied, setCopied] = useState(false)

  /** False only on the very first screen of the visit. The opening wording is
   * revealed by the site's own entrance (`RevealText`); everything after it is
   * a transition from something, which is `MorphText`'s job. It never goes back
   * to false — returning to the hub is a morph out of the question just left,
   * not a fresh arrival. */
  const [hasMoved, setHasMoved] = useState(false)

  /** Honeypot value. Bound to a field no human can see or tab into, so anything
   * other than an empty string means the submission was automated. */
  const [website, setWebsite] = useState("")

  /** Set when a branch is picked, checked server-side against a minimum fill
   * time. */
  const startedAt = useRef(0)

  const branch = branchId ? findBranch(branchId) : undefined
  const steps = useMemo(() => branch?.steps ?? [], [branch])
  const step: ContactStep | undefined = steps[stepIndex]

  const stepError = step ? validateStep(step, answers) : null

  // An untouched step only disables the button; a step that has been answered
  // and is still wrong owes the visitor an explanation.
  const visibleError =
    phase === "flow" && step && stepError && !isStepEmpty(step, answers) ? stepError : null

  const question =
    phase === "hub"
      ? HUB_QUESTION
      : phase === "recap"
        ? RECAP_QUESTION
        : phase === "sent"
          ? `Merci${firstNameFrom(answers) ? `, ${firstNameFrom(answers)}` : ""}.`
          : (step?.question ?? HUB_QUESTION)

  // ---------------------------------------------------------------- answers

  const setAnswer = useCallback((key: string, value: string | string[]) => {
    setAnswers((current) => ({ ...current, [key]: value }))
  }, [])

  const toggleInList = useCallback((key: string, value: string) => {
    setAnswers((current) => {
      const list = Array.isArray(current[key]) ? (current[key] as string[]) : []
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value],
      }
    })
  }, [])

  // ------------------------------------------------------------- navigation

  const startBranch = useCallback((id: string) => {
    setHasMoved(true)
    startedAt.current = Date.now()
    setBranchId(id)
    setStepIndex(0)
    setAnswers({})
    setStatus("idle")
    setPhase("flow")
  }, [])

  const goBack = useCallback(() => {
    setStatus("idle")

    if (phase === "recap") {
      setPhase("flow")
      setStepIndex(Math.max(steps.length - 1, 0))
      return
    }
    if (stepIndex === 0) {
      setPhase("hub")
      setBranchId(null)
      return
    }
    setStepIndex((current) => current - 1)
  }, [phase, stepIndex, steps.length])

  const goToStep = useCallback((index: number) => {
    setStatus("idle")
    setStepIndex(index)
    setPhase("flow")
  }, [])

  const send = useCallback(async () => {
    if (!branch) return
    setStatus("sending")
    setFailureMessage("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: branch.id,
          answers,
          website,
          startedAt: startedAt.current,
        }),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null
        setFailureMessage(body?.message ?? "L'envoi a échoué. Réessaie dans un instant.")
        setStatus("failed")
        return
      }

      setStatus("idle")
      setPhase("sent")
    } catch {
      setFailureMessage("Connexion impossible. Vérifie ton réseau et réessaie.")
      setStatus("failed")
    }
  }, [answers, branch, website])

  const goNext = useCallback(() => {
    if (phase === "recap") {
      void send()
      return
    }
    // Unreachable from the button, which is disabled while this holds — but
    // Enter in a field reaches it.
    if (stepError) return
    if (stepIndex === steps.length - 1) {
      setPhase("recap")
      return
    }
    setStepIndex((current) => current + 1)
  }, [phase, send, stepError, stepIndex, steps.length])

  // ------------------------------------------------- panel crossfade layers

  // Two screens are kept on stage during a transition: the one arriving, in
  // normal flow, and the one leaving, lifted out of the layout on top of it.
  // Swapping the content outright — which is what React does on its own — made
  // the panel vanish for the length of the question's morph, and the answer
  // area is most of the page.
  const [panel, setPanel] = useState<{ current: Screen; previous: Screen | null }>({
    current: { phase: "hub", stepIndex: 0, branchId: null },
    previous: null,
  })

  if (
    panel.current.phase !== phase ||
    panel.current.stepIndex !== stepIndex ||
    panel.current.branchId !== branchId
  ) {
    setPanel({ current: { phase, stepIndex, branchId }, previous: panel.current })
  }

  const bandRef = useRef<HTMLDivElement>(null)
  const incomingRef = useRef<HTMLDivElement>(null)
  const outgoingRef = useRef<HTMLDivElement>(null)

  /** Height the answer area is currently showing. The outgoing screen is
   * absolutely positioned the moment it starts leaving, so by the time the
   * effect runs there is nothing left in the layout to measure the previous
   * height from — it has to be remembered. */
  const shownHeight = useRef(0)

  // Same completion-based guard as MorphText: marking a transition handled when
  // it starts means React's double-invoked mount effect kills the timeline and
  // then skips the retry, leaving the panel stuck at `opacity: 0`.
  const settledFor = useRef<Screen | null>(null)

  useLayoutEffect(() => {
    const band = bandRef.current
    const incoming = incomingRef.current
    if (!band || !incoming) return
    if (settledFor.current === panel.current) return

    const target = incoming.offsetHeight

    const settle = () => {
      settledFor.current = panel.current
      shownHeight.current = target
      band.style.height = ""
      band.style.overflow = ""
      setPanel((state) => (state.previous ? { ...state, previous: null } : state))
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle()
      return
    }

    const timeline = gsap.timeline()
    const outgoing = outgoingRef.current

    // The whole composition is centred in the viewport, so a screen of a
    // different height re-centres the group and drags the question with it.
    // Tweening the height turns that into a glide instead of a jump, which is
    // the only reason the question can stay optically centred without a fixed
    // reserve of empty space under it.
    if (outgoing && shownHeight.current > 0 && shownHeight.current !== target) {
      band.style.overflow = "hidden"
      timeline.fromTo(
        band,
        { height: shownHeight.current },
        { height: target, duration: PANEL_RESIZE, ease: "power2.inOut" },
        0,
      )
    }

    if (outgoing) {
      timeline.to(outgoing, { autoAlpha: 0, y: -8, duration: PANEL_OUT, ease: "power2.in" }, 0)
    }

    // Starts almost immediately rather than waiting for the outgoing content to
    // finish leaving: the overlap is what removes the empty beat, and it is the
    // same overlap the question's own words are playing above it.
    timeline.fromTo(
      incoming,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: PANEL_IN, ease: "power2.out" },
      outgoing ? 0.06 : 0,
    )

    timeline.call(settle)

    return () => {
      // Interrupted mid-resize — clicking through two steps quickly. Remember
      // the height actually on screen, not the one this transition was aiming
      // for, so the next one carries on from where the eye left it.
      if (band.style.height) shownHeight.current = band.offsetHeight
      timeline.kill()
    }
  }, [panel])

  // Typing should start where the visitor is looking. Not on touch: focusing an
  // input there throws up the keyboard over the question they have not read.
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  useEffect(() => {
    if (phase !== "flow") return
    if (window.matchMedia("(pointer: coarse)").matches) return
    fieldRef.current?.focus()
  }, [phase, stepIndex])

  // Tells globals.css to drop the header's "Réserve un appel" pill for as long
  // as the flow is on screen. Cleared on unmount so leaving the page — by the
  // logo, the menu, or the back button — always restores it.
  useEffect(() => {
    const inFlow = phase === "flow" || phase === "recap"
    document.body.dataset.contactFlow = inFlow ? "active" : "idle"
    return () => {
      delete document.body.dataset.contactFlow
    }
  }, [phase])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      // Clipboard access can be refused outright (insecure context, permission
      // policy). Falling back to the address in plain sight beats a dead button.
      setFailureMessage(`Copie impossible, l'adresse est ${EMAIL}`)
      setStatus("failed")
    }
  }, [])

  // --------------------------------------------------------------- render

  const renderScreen = (screen: Screen, isCurrent: boolean) => {
    const screenBranch = screen.branchId ? findBranch(screen.branchId) : undefined
    const screenStep = screenBranch?.steps[screen.stepIndex]

    const screenHint =
      screen.phase === "recap"
        ? "Clique sur une réponse pour la corriger."
        : screen.phase === "sent"
          ? "Je réponds en général sous 24 h, du lundi au vendredi."
          : screen.phase === "flow"
            ? screenStep?.hint
            : undefined

    return (
      <>
        {screenHint && (
          <p className="max-w-[46ch] text-sm leading-relaxed text-black/45">{screenHint}</p>
        )}

        {screen.phase === "hub" && <Hub onStart={startBranch} onCopy={copyEmail} copied={copied} />}

        {screen.phase === "flow" && screenStep && (
          <StepFields
            step={screenStep}
            answers={answers}
            fieldRef={isCurrent ? fieldRef : undefined}
            onSetAnswer={setAnswer}
            onToggle={toggleInList}
            onSubmitKey={goNext}
          />
        )}

        {screen.phase === "recap" && screenBranch && (
          <Recap
            lines={describeAnswers(screenBranch, answers)}
            onEdit={goToStep}
            sending={status === "sending"}
          />
        )}

        {screen.phase === "sent" && <Sent />}
      </>
    )
  }

  return (
    <section className="relative isolate flex min-h-dvh flex-col items-center justify-center bg-[#f2f2f2] px-4 pt-32 pb-44 text-black">
      <ContactBackdrop />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <h1 className="w-full text-[clamp(1.6rem,4.2vw,2.75rem)] leading-[1.1] tracking-[-0.03em]">
          {hasMoved ? (
            <MorphText text={question} morphFrom={HUB_QUESTION} />
          ) : (
            <RevealText trigger="load">{question}</RevealText>
          )}
        </h1>

        {/* The answer area is exactly as tall as its content — no reserve of
          * empty space, which is what pushed the buttons away from the question
          * on the short screens. The height difference between one screen and
          * the next is animated instead. */}
        <div ref={bandRef} className="relative mt-10 w-full">
          {panel.previous && (
            <div
              ref={outgoingRef}
              inert
              aria-hidden="true"
              className="absolute inset-x-0 top-0 flex flex-col items-center gap-5"
            >
              {renderScreen(panel.previous, false)}
            </div>
          )}
          <div ref={incomingRef} className="flex w-full flex-col items-center gap-5">
            {renderScreen(panel.current, true)}
          </div>
        </div>

        {visibleError && (
          <p role="alert" className="mt-5 text-sm text-black/60">
            {visibleError}
          </p>
        )}

        {status === "failed" && failureMessage && (
          <p role="alert" className="mt-5 text-sm text-black/60">
            {failureMessage}
          </p>
        )}
      </div>

      {/* Anchored to the foot of the viewport rather than flowing after the
        * content, so it never moves as answers change size. */}
      {(phase === "flow" || phase === "recap") && (
        <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center px-4 md:bottom-12">
          <ContactStepper
            index={phase === "recap" ? steps.length : stepIndex}
            total={steps.length}
            backLabel={stepIndex === 0 && phase === "flow" ? "Annuler" : "Retour"}
            nextLabel={
              phase === "recap"
                ? status === "sending"
                  ? "Envoi…"
                  : "Envoyer"
                : stepIndex === steps.length - 1
                  ? "Relire"
                  : "Suivant"
            }
            nextDisabled={status === "sending" || (phase === "flow" && stepError !== null)}
            onBack={goBack}
            onNext={goNext}
          />
        </div>
      )}

      {/* Honeypot. Off-screen rather than `display: none` — some bots skip
        * hidden fields, far fewer skip fields that are merely out of view. */}
      <label className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
        <span aria-hidden="true">Ne pas remplir</span>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </label>
    </section>
  )
}

// ------------------------------------------------------------------ screens

function Hub({
  onStart,
  onCopy,
  copied,
}: {
  onStart: (branchId: string) => void
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {CONTACT_BRANCHES.map((branch) => (
        <button
          key={branch.id}
          type="button"
          onClick={() => onStart(branch.id)}
          className={PRIMARY_CLASS}
        >
          {branch.label}
        </button>
      ))}

      <button type="button" onClick={onCopy} className={SECONDARY_CLASS}>
        {copied ? "Email copié" : "Copier mon email"}
      </button>
    </div>
  )
}

const FIELD_CLASS =
  "w-full border-b border-black/25 bg-transparent pb-2 text-lg outline-none transition-colors placeholder:text-black/25 focus:border-black"

function StepFields({
  step,
  answers,
  fieldRef,
  onSetAnswer,
  onToggle,
  onSubmitKey,
}: {
  step: ContactStep
  answers: ContactAnswers
  /** Only the screen currently on stage takes focus; the one fading out must
   * not steal the caret back. */
  fieldRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  onSetAnswer: (key: string, value: string | string[]) => void
  onToggle: (key: string, value: string) => void
  onSubmitKey: () => void
}) {
  const textValue = typeof answers[step.id] === "string" ? (answers[step.id] as string) : ""

  if (step.kind === "textarea") {
    return (
      <div className="w-full max-w-xl">
        <textarea
          ref={fieldRef as React.RefObject<HTMLTextAreaElement> | undefined}
          rows={4}
          value={textValue}
          placeholder={step.placeholder}
          onChange={(event) => onSetAnswer(step.id, event.target.value)}
          // Enter has to stay a line break in a free-text answer, so the
          // shortcut moves to the modifier every editor already uses for "send".
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              onSubmitKey()
            }
          }}
          className={`${FIELD_CLASS} resize-none text-left leading-relaxed`}
        />
        <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-black/30">
          Ctrl + Entrée pour continuer
        </p>
      </div>
    )
  }

  if (step.kind === "choice") {
    const selected = Array.isArray(answers[step.id]) ? (answers[step.id] as string[]) : []
    return (
      <div className="flex w-full max-w-xl flex-wrap justify-center gap-2">
        {step.options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={selected.includes(option.value)}
            onClick={() =>
              step.multiple ? onToggle(step.id, option.value) : onSetAnswer(step.id, [option.value])
            }
          />
        ))}
      </div>
    )
  }

  if (step.kind === "choice-group") {
    return (
      <div className="flex w-full max-w-xl flex-col items-center gap-7">
        {step.groups.map((group) => (
          <div key={group.id} className="w-full">
            <p className="text-[10px] uppercase tracking-[0.16em] text-black/35">
              {group.label}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {group.options.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={answers[group.id] === option.value}
                  onClick={() => onSetAnswer(group.id, option.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <input
        ref={fieldRef as React.RefObject<HTMLInputElement> | undefined}
        type={step.kind === "email" ? "email" : step.kind === "tel" ? "tel" : "text"}
        inputMode={step.kind === "tel" ? "tel" : step.kind === "email" ? "email" : "text"}
        autoComplete={step.kind === "email" ? "email" : step.kind === "tel" ? "tel" : "off"}
        value={textValue}
        placeholder={step.placeholder}
        onChange={(event) => onSetAnswer(step.id, event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            onSubmitKey()
          }
        }}
        className={`${FIELD_CLASS} text-center`}
      />
      <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-black/30">
        Entrée pour continuer
      </p>
    </div>
  )
}

/** Selected reads as filled, unselected as drawn — the same relationship the
 * header's two pills already have. */
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
        selected
          ? "border-black bg-black text-white"
          : "border-black/20 text-black/70 hover:border-black/60 hover:text-black"
      }`}
    >
      {label}
    </button>
  )
}

function Recap({
  lines,
  onEdit,
  sending,
}: {
  lines: Array<{ stepIndex: number; label: string; value: string }>
  onEdit: (stepIndex: number) => void
  sending: boolean
}) {
  return (
    <div className="w-full max-w-xl">
      <dl className="flex flex-col border-t border-black/10 text-left">
        {lines.map((line) => (
          <button
            key={`${line.stepIndex}-${line.label}`}
            type="button"
            disabled={sending}
            onClick={() => onEdit(line.stepIndex)}
            className="flex w-full cursor-pointer items-baseline gap-6 border-b border-black/10 py-3 text-left transition-colors hover:bg-black/[0.04] disabled:cursor-not-allowed"
          >
            <dt className="w-32 shrink-0 text-[10px] uppercase tracking-[0.14em] text-black/35">
              {line.label}
            </dt>
            <dd className="flex-1 whitespace-pre-line text-sm leading-relaxed text-black/75">
              {line.value}
            </dd>
          </button>
        ))}
      </dl>

      <p className="mt-6 text-xs leading-relaxed text-black/35">
        Ces informations me servent uniquement à te répondre. Voir la{" "}
        <TransitionLink href="/confidentialite" label="Confidentialité" className="underline">
          politique de confidentialité
        </TransitionLink>
        .
      </p>
    </div>
  )
}

function Sent() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <TransitionLink href="/projets" label="Projets" className={PRIMARY_CLASS}>
        Voir les projets
      </TransitionLink>
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={SECONDARY_CLASS}
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}
