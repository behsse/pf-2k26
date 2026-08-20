/** Shape, validation and rendering of a contact submission.
 *
 * The client uses `validateStep` to decide whether `Suivant` is enabled and
 * `describeAnswers` to build the recap screen. The API route uses
 * `validateSubmission` — which is the only one that matters, since the browser
 * side of any validation is a convenience and never a guarantee — and
 * `renderSubmissionText` to compose the email.
 *
 * Both sides walk the same `CONTACT_BRANCHES` definition, so adding a question
 * to the flow cannot leave its validation behind. */

import { findBranch, stepAnswerKeys } from "../data/contactFlow"
import type { ContactBranch, ContactStep } from "../data/contactFlow"

/** One answer per key. Arrays only ever come from multi-select steps. */
export type ContactAnswers = Record<string, string | string[]>

export type ContactSubmission = {
  branch: string
  answers: ContactAnswers
  /** Honeypot. A real visitor never sees the field, so anything here is a bot. */
  website: string
  /** Epoch ms captured when the visitor picked a branch, used to reject
   * submissions that were filled faster than a human could type. */
  startedAt: number
}

/** Per-field caps. Nothing here is stored, but an unbounded textarea is a free
 * way to hand a stranger control over the size of every email you receive. */
const MAX_LENGTHS: Record<ContactStep["kind"], number> = {
  text: 160,
  email: 200,
  tel: 40,
  textarea: 5000,
  choice: 0,
  "choice-group": 0,
}

/** Deliberately loose. Address syntax is far wider than any regex people
 * actually write, and the only real proof an address works is a delivered
 * email — so this rejects the obviously-broken and lets the rest through. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Digits, spaces and the punctuation phone numbers are written with. */
const TEL_PATTERN = /^[+()\d][\d\s().-]{5,}$/

function readText(answers: ContactAnswers, key: string): string {
  const value = answers[key]
  return typeof value === "string" ? value.trim() : ""
}

function readList(answers: ContactAnswers, key: string): string[] {
  const value = answers[key]
  if (Array.isArray(value)) return value.filter((entry) => typeof entry === "string")
  return typeof value === "string" && value !== "" ? [value] : []
}

/** `null` when the step is answered well enough to move on, otherwise the
 * message to show under the field. */
export function validateStep(step: ContactStep, answers: ContactAnswers): string | null {
  if (step.kind === "choice-group") {
    const missing = step.groups.filter((group) => readText(answers, group.id) === "")
    if (missing.length > 0 && !step.optional) {
      return missing.length === step.groups.length
        ? "Choisis une réponse dans chaque liste."
        : `Il manque : ${missing.map((group) => group.label.toLowerCase()).join(", ")}.`
    }
    for (const group of step.groups) {
      const chosen = readText(answers, group.id)
      if (chosen !== "" && !group.options.some((option) => option.value === chosen)) {
        return "Cette réponse n'existe pas."
      }
    }
    return null
  }

  if (step.kind === "choice") {
    const chosen = readList(answers, step.id)
    if (chosen.length === 0) return step.optional ? null : "Choisis au moins une réponse."
    if (!step.multiple && chosen.length > 1) return "Une seule réponse ici."
    if (!chosen.every((value) => step.options.some((option) => option.value === value))) {
      return "Cette réponse n'existe pas."
    }
    return null
  }

  const value = readText(answers, step.id)
  if (value === "") return step.optional ? null : "Il me faut une réponse pour continuer."
  if (value.length > MAX_LENGTHS[step.kind]) {
    return `C'est un peu long — ${MAX_LENGTHS[step.kind]} caractères maximum.`
  }
  if (step.kind === "email" && !EMAIL_PATTERN.test(value)) return "Cette adresse a l'air incomplète."
  if (step.kind === "tel" && !TEL_PATTERN.test(value)) return "Ce numéro a l'air incomplet."
  return null
}

/** Whether the visitor has given this step anything at all.
 *
 * It separates "not answered yet" from "answered wrongly", which need opposite
 * treatments: an untouched step disables `Suivant` and says nothing, while a
 * filled-in one that fails validation has to explain itself on the spot. */
export function isStepEmpty(step: ContactStep, answers: ContactAnswers): boolean {
  if (step.kind === "choice-group") {
    return step.groups.every((group) => readText(answers, group.id) === "")
  }
  if (step.kind === "choice") return readList(answers, step.id).length === 0
  return readText(answers, step.id) === ""
}

export type SubmissionCheck =
  | { ok: true; branch: ContactBranch; answers: ContactAnswers }
  | { ok: false; status: number; message: string }

/** How fast a submission has to arrive to be treated as automated. Two seconds
 * is well under the time it takes to read the first question, let alone answer
 * five of them. */
const MIN_FILL_MS = 2000

/** The server-side gate. Everything the browser sends is treated as hostile:
 * unknown branch, unknown answer keys, oversized values and bot tells are all
 * rejected here rather than trusted because the UI would not have produced
 * them. */
export function validateSubmission(payload: unknown): SubmissionCheck {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, status: 400, message: "Requête invalide." }
  }

  const { branch: branchId, answers, website, startedAt } = payload as Partial<ContactSubmission>

  // Silent rejection is the point of a honeypot: telling the bot it was caught
  // is what lets whoever wrote it fix the bot.
  if (typeof website === "string" && website.trim() !== "") {
    return { ok: false, status: 400, message: "Requête invalide." }
  }

  if (typeof startedAt !== "number" || !Number.isFinite(startedAt)) {
    return { ok: false, status: 400, message: "Requête invalide." }
  }
  if (Date.now() - startedAt < MIN_FILL_MS) {
    return { ok: false, status: 400, message: "Requête invalide." }
  }

  if (typeof branchId !== "string") {
    return { ok: false, status: 400, message: "Requête invalide." }
  }
  const branch = findBranch(branchId)
  if (!branch) return { ok: false, status: 400, message: "Requête invalide." }

  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
    return { ok: false, status: 400, message: "Requête invalide." }
  }

  // Only keys the branch actually declares survive. Anything else would ride
  // straight into the email body.
  const allowedKeys = new Set(branch.steps.flatMap(stepAnswerKeys))
  const cleaned: ContactAnswers = {}
  for (const [key, value] of Object.entries(answers as ContactAnswers)) {
    if (!allowedKeys.has(key)) continue
    if (typeof value === "string") {
      cleaned[key] = value.slice(0, MAX_LENGTHS.textarea)
    } else if (Array.isArray(value)) {
      cleaned[key] = value
        .filter((entry): entry is string => typeof entry === "string")
        .slice(0, 20)
        .map((entry) => entry.slice(0, MAX_LENGTHS.text))
    }
  }

  for (const step of branch.steps) {
    const error = validateStep(step, cleaned)
    if (error) return { ok: false, status: 422, message: error }
  }

  return { ok: true, branch, answers: cleaned }
}

export type DescribedAnswer = {
  /** Index of the step this line came from, so the recap can jump back to it. */
  stepIndex: number
  label: string
  value: string
}

/** Flattens the answers into readable label/value pairs, resolving option
 * values back to their labels. Shared by the recap screen and the email so the
 * visitor reads exactly what lands in the inbox. */
export function describeAnswers(branch: ContactBranch, answers: ContactAnswers): DescribedAnswer[] {
  const lines: DescribedAnswer[] = []

  branch.steps.forEach((step, stepIndex) => {
    if (step.kind === "choice-group") {
      for (const group of step.groups) {
        const chosen = readText(answers, group.id)
        const option = group.options.find((entry) => entry.value === chosen)
        lines.push({ stepIndex, label: group.label, value: option?.label ?? "—" })
      }
      return
    }

    if (step.kind === "choice") {
      const chosen = readList(answers, step.id)
      const labels = chosen
        .map((value) => step.options.find((option) => option.value === value)?.label)
        .filter((label): label is string => Boolean(label))
      lines.push({ stepIndex, label: step.recapLabel, value: labels.join(", ") || "—" })
      return
    }

    lines.push({ stepIndex, label: step.recapLabel, value: readText(answers, step.id) || "—" })
  })

  return lines
}

/** Plain-text email body. Plain text on purpose: it renders identically in
 * every client, cannot be broken by a stray angle bracket in the brief, and is
 * the format you actually want to read on a phone. */
export function renderSubmissionText(branch: ContactBranch, answers: ContactAnswers): string {
  const lines = describeAnswers(branch, answers).map(({ label, value }) => `${label}\n${value}`)
  return [`${branch.title}`, "", ...lines].join("\n\n")
}

/** Best-effort first name, used to address the visitor on the success screen. */
export function firstNameFrom(answers: ContactAnswers): string {
  return readText(answers, "nom").split(/\s+/)[0] ?? ""
}

/** The visitor's own address, set as `reply-to` so answering the notification
 * answers the visitor. */
export function replyToFrom(answers: ContactAnswers): string | null {
  const email = readText(answers, "email")
  return EMAIL_PATTERN.test(email) ? email : null
}
