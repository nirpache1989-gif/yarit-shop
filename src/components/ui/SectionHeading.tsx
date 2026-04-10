/**
 * @file SectionHeading — reusable h2 with eyebrow + flourish
 * @summary Standard heading for homepage sections. Features:
 *            - optional small italic eyebrow ("הבחירות שלי" style)
 *            - large Frank Ruhl Libre serif h2 (via --font-display)
 *            - optional small sprig flourish before the title
 *            - optional subheading below
 *
 *          Centered by default. Pass `align="start"` for left/right
 *          aligned (locale aware).
 *
 *          See: docs/DECISIONS.md — design review punchlist B2, C1, C2.
 */
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Eyebrow } from '@/components/ui/Eyebrow'

type Props = {
  title: string
  eyebrow?: string
  subheading?: string
  align?: 'center' | 'start'
  className?: string
  children?: ReactNode
}

export function SectionHeading({
  title,
  eyebrow,
  subheading,
  align = 'center',
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        align === 'center' ? 'items-center text-center' : 'items-start text-start',
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow as="p" tone="accent" className="mb-1">
          {eyebrow}
        </Eyebrow>
      )}
      <h2
        className="flex items-center gap-3 font-[var(--font-display)] font-bold text-3xl md:text-4xl lg:text-5xl text-[var(--color-primary-dark)] leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <Sprig />
        <span>{title}</span>
        <Sprig flip />
      </h2>
      {subheading && (
        <p className="text-sm md:text-base text-[var(--color-muted)] max-w-2xl">
          {subheading}
        </p>
      )}
      {children}
    </div>
  )
}

function Sprig({ flip }: { flip?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(
        'text-[var(--color-primary)]/60 flex-shrink-0',
        flip && 'scale-x-[-1]',
      )}
    >
      <path d="M4 20 C 8 14, 14 10, 20 8" />
      <path d="M8 17 q 2 -4, 6 -5" />
      <path d="M12 14 q 2 -4, 6 -4" />
    </svg>
  )
}
