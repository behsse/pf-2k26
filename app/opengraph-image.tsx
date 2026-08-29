import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"

/** The card every shared link shows, on every page that does not provide its
 * own (the case studies do: their hero is a better argument than any card).
 *
 * Generated rather than exported by hand so the wording and the mark can never
 * fall out of step with the site, and so there is no 1200x630 PNG to maintain
 * in `public/`. */
export const alt = "Behsse, designer et développeur web freelance en France"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public", "logo.svg"), "utf8")
  const white = logo.replaceAll("<path ", '<path fill="#ffffff" ')
  const src = `data:image/svg+xml;base64,${Buffer.from(white).toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: 72,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={148} height={100} alt="" />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            Designer et développeur web freelance
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.6)" }}>
            Sites sur-mesure, identité de marque, développement Next.js
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          studio.behsse.com
        </div>
      </div>
    ),
    size,
  )
}
