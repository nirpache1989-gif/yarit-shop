/**
 * @file Badge — small pill label
 * @summary Used for "New", "Featured", "Sale", etc. Three visual
 *          variants matching the palette.
 */
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'primary' | 'accent' | 'muted'

type Props = {
  children: ReactNode
  tone?: Tone
  className?: string
}

const toneClasses: Record<Tone, string> = {
  primary: 'bg-[var(--color-primary)] text-white',
  accent: 'bg-[var(--color-accent)] text-white',
  muted: 'bg-[var(--color-surface-warm)] text-[var(--color-muted)] border border-[var(--color-border-brand)]',
}

export function Badge({ children, tone = 'primary', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
