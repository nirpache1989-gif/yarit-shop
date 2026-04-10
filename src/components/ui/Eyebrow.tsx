/**
 * @file Eyebrow — small-caps tracked accent above section headings
 * @summary Premium wellness brands (Aesop, Le Labo, Augustinus Bader)
 *          all use small uppercase eyebrow text above their section
 *          headings as a typographic accent. This component is the
 *          single source of truth for that pattern in the storefront.
 *
 *          Renders as 11–12px uppercase with ~0.14em tracking, sage
 *          colour by default. Use `tone="accent"` for the warm-tan
 *          accent variant or `tone="muted"` for a subtler grey.
 *
 *          Styled by `.eyebrow` rules in `src/app/globals.css`.
 */
import { cn } from '@/lib/cn'

type EyebrowProps = {
  children: React.ReactNode
  tone?: 'primary' | 'accent' | 'muted'
  className?: string
  as?: 'span' | 'p' | 'div' | 'h2' | 'h3' | 'h4'
}

export function Eyebrow({
  children,
  tone = 'primary',
  className,
  as: Tag = 'span',
}: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'eyebrow',
        tone === 'accent' && 'eyebrow--accent',
        tone === 'muted' && 'eyebrow--muted',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
