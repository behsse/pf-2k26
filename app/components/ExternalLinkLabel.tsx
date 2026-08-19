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
 * its colour from the parent, which is why it works on white and on black. */
export function ExternalLinkLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative block h-lh overflow-hidden">
        <span className="flex flex-col transition-transform duration-400 ease-out group-hover:-translate-y-1/2">
          <span>{label}</span>
          <span aria-hidden="true">{label}</span>
        </span>
      </span>
      <MoveUpRightIcon className="h-3.5 w-3.5 translate-y-0.5 -translate-x-0.5 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:translate-x-0 group-hover:opacity-100" />
    </span>
  )
}
