import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"

/** iOS refuses SVG for a home-screen icon, so `app/icon.svg` cannot serve here.
 * This renders the same mark to a PNG at build time instead of asking anyone to
 * export one by hand and keep it in step with the logo. */
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default async function AppleIcon() {
  const logo = await readFile(path.join(process.cwd(), "public", "logo.svg"), "utf8")
  // The source file has no fill of its own and inherits black from the page.
  // There is no page here, and the icon sits on a dark tile, so the mark is
  // forced white before it is embedded.
  const white = logo.replaceAll("<path ", '<path fill="#ffffff" ')
  const src = `data:image/svg+xml;base64,${Buffer.from(white).toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={132} height={89} alt="" />
      </div>
    ),
    size,
  )
}
