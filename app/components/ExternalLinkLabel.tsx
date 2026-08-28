/** lucide.dev "move-up-right" icon. */
export function MoveUpRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M13 5H19V11" />
      <path d="M19 5L5 19" />
    </svg>
  )
}

/** Contact/social link: the label sits above an identical duplicate, both
 * clipped by a one-line-tall overflow-hidden mask. On hover the pair
 * shifts up by exactly one line, so the duplicate rolls into view where
 * the original was — never showing a partial line above or below — and
 * settles back down when the pointer leaves. The arrow slides in the same
 * beat, signaling "this leaves the page".
 *
 * Shared by the nav menu and the footer so both stay identical; it inherits
 * its colour from the parent, which is why it works on white and on black.
 *
 * `underline` draws a rule under the text alone at rest, so nothing hints at
 * a second element waiting to the right. On hover it grows by exactly the
 * arrow's own width plus its gap (ARROW_TRACK) and lands under the arrow as
 * that arrow fades in, so the two read as one move. The arrow itself is
 * positioned out of the flow, which is what keeps the resting rule — and the
 * link's own box — the width of the text. */
export function ExternalLinkLabel({
  label,
  underline = false,
}: {
  label: string
  underline?: boolean
}) {
  return (
    <span className="relative inline-flex items-center">
      <span className={`relative block ${underline ? "pb-1" : ""}`}>
        <span className="relative block h-lh overflow-hidden">
          <span className="flex flex-col transition-transform duration-400 ease-out group-hover:-translate-y-1/2">
            <span>{label}</span>
            <span aria-hidden="true">{label}</span>
          </span>
        </span>
        {underline && (
          /* 1.25rem = the arrow's gap (ml-1.5) plus its width (w-3.5). */
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-current opacity-40 transition-[width,opacity] duration-300 ease-out group-hover:w-[calc(100%+1.25rem)] group-hover:opacity-100"
          />
        )}
      </span>
      <MoveUpRightIcon className="absolute left-full top-1/2 ml-1.5 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
    </span>
  )
}
