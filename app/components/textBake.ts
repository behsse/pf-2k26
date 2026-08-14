export function measureFontAscent(ctx: CanvasRenderingContext2D, fontSize: number): number {
  const metrics = ctx.measureText("Mg")
  const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent
  return typeof ascent === "number" && ascent > 0 ? ascent : fontSize * 0.8
}
