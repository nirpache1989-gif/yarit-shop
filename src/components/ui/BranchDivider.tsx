/**
 * @file BranchDivider — decorative section separator
 * @summary Inline SVG of a hand-drawn sage sprig used between
 *          homepage sections. Centered, muted at ~50% opacity, with
 *          a thin horizontal hairline on either side so the
 *          transition reads as intentional rather than random.
 *
 *          Uses currentColor so the stroke picks up the primary
 *          brand color via text-[var(--color-primary)] on the parent.
 *
 *          See: docs/DECISIONS.md — design review punchlist B1.
 */
import { cn } from '@/lib/cn'

type Props = {
  className?: string
}

export function BranchDivider({ className }: Props) {
  return (
    <div
      className={cn(
        'flex items-center justify-center py-4 text-[var(--color-primary)]/50',
        className,
      )}
      aria-hidden
    >
      <span className="h-px flex-1 max-w-[140px] bg-[var(--color-border-brand)]" />
      <svg
        width="120"
        height="40"
        viewBox="0 0 120 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-3"
      >
        {/* central stem */}
        <path d="M10 20 C 40 14, 80 26, 110 20" />
        {/* leaves — sage-like ovals on alternating sides */}
        <path d="M28 18 q 2 -8, 10 -6 q -2 8, -10 6 z" fill="currentColor" fillOpacity="0.25" />
        <path d="M44 23 q -2 8, -10 6 q 2 -8, 10 -6 z" fill="currentColor" fillOpacity="0.25" />
        <path d="M60 18 q 2 -9, 10 -7 q -2 9, -10 7 z" fill="currentColor" fillOpacity="0.25" />
        <path d="M76 22 q -2 8, -10 6 q 2 -8, 10 -6 z" fill="currentColor" fillOpacity="0.25" />
        <path d="M92 18 q 2 -8, 10 -6 q -2 8, -10 6 z" fill="currentColor" fillOpacity="0.25" />
        {/* small dot berries */}
        <circle cx="22" cy="22" r="1.4" fill="currentColor" fillOpacity="0.4" />
        <circle cx="98" cy="22" r="1.4" fill="currentColor" fillOpacity="0.4" />
      </svg>
      <span className="h-px flex-1 max-w-[140px] bg-[var(--color-border-brand)]" />
    </div>
  )
}
