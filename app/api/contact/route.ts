import type { NextRequest } from "next/server"
import { Resend } from "resend"
import {
  renderSubmissionText,
  replyToFrom,
  validateSubmission,
} from "../../lib/contactSubmission"

/** Node runtime rather than edge: the Resend SDK expects it, and this route is
 * called once per visitor at most — the cold start costs nothing here. */
export const runtime = "nodejs"

/** No caching layer should ever sit in front of a submission endpoint. */
export const dynamic = "force-dynamic"

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3

/** In-process rate limiting.
 *
 * On Vercel each serverless instance keeps its own map and loses it when the
 * instance is recycled, so this bounds a single sender's burst rather than
 * guaranteeing a global cap. That is the right trade for a portfolio contact
 * form — it costs nothing and stops the obvious flood. Swap in Upstash or
 * Vercel KV the day this page is worth attacking properly. */
const recentSubmissions = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const timestamps = (recentSubmissions.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  )

  if (timestamps.length >= RATE_LIMIT_MAX) {
    recentSubmissions.set(key, timestamps)
    return true
  }

  timestamps.push(now)
  recentSubmissions.set(key, timestamps)

  // The map would otherwise grow one entry per address forever. Anything whose
  // window has fully expired is dead weight.
  if (recentSubmissions.size > 500) {
    for (const [entryKey, entryTimestamps] of recentSubmissions) {
      if (entryTimestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
        recentSubmissions.delete(entryKey)
      }
    }
  }

  return false
}

/** The first hop in `x-forwarded-for` is the client as far as Vercel's proxy is
 * concerned. Header spoofing is possible in principle; the honeypot and the
 * minimum fill time are what actually carry the anti-abuse weight. */
function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "inconnu"
}

function jsonError(message: string, status: number) {
  return Response.json({ ok: false, message }, { status })
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  const to = process.env.CONTACT_TO_EMAIL

  // A misconfigured deployment must not look like a delivered message: the
  // visitor would walk away believing they had reached someone.
  if (!apiKey || !from || !to) {
    console.error("[contact] RESEND_API_KEY, CONTACT_FROM_EMAIL or CONTACT_TO_EMAIL is missing")
    return jsonError("L'envoi est momentanément indisponible. Écris-moi directement par email.", 503)
  }

  if (isRateLimited(clientKey(request))) {
    return jsonError("Trop de messages d'affilée. Réessaie dans quelques minutes.", 429)
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonError("Requête invalide.", 400)
  }

  const checked = validateSubmission(payload)
  if (!checked.ok) return jsonError(checked.message, checked.status)

  const { branch, answers } = checked
  const replyTo = replyToFrom(answers)

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `${branch.title} — behsse.fr`,
      text: renderSubmissionText(branch, answers),
      ...(replyTo ? { replyTo } : {}),
    })

    if (error) {
      console.error("[contact] Resend refused the message:", error)
      return jsonError("L'envoi a échoué. Réessaie dans un instant.", 502)
    }
  } catch (error) {
    console.error("[contact] Resend request failed:", error)
    return jsonError("L'envoi a échoué. Réessaie dans un instant.", 502)
  }

  return Response.json({ ok: true })
}
