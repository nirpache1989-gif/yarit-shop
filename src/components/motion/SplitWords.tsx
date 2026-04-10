/**
 * @file SplitWords — word-by-word fade-up reveal
 * @summary Splits a string into words, wraps each in a <span>, and
 *          staggers a fade-up animation across them on mount. Used
 *          by the hero headline so "שורשים של בריאות" reveals one
 *          word at a time (~200ms apart) as a calm editorial entrance.
 *
 *          Notes:
 *            - Text only. Pass a plain string. Rich formatting has
 *              to go through a more specialized component.
 *            - Hebrew + English both work. The component doesn't
 *              care about writing direction — it just splits on
 *              whitespace and preserves the original order, which
 *              the parent's `dir=` attribute handles.
 *            - Uses the same `@keyframes fade-up` that the existing
 *              `.animate-fade-up` class uses, so the motion feels
 *              consistent with the rest of the brand.
 *            - Motion is disabled under `prefers-reduced-motion` by
 *              the global guard in globals.css.
 */
'use client'

import type { CSSProperties, ElementType } from 'react'

type Props = {
  /** The sentence to split. */
  children: string
  /** Milliseconds between each word. Default: 180. */
  stagger?: number
  /** Base delay before the first word starts. Default: 0. */
  baseDelay?: number
  /** Element tag to render. Default: 'h1'. */
  as?: ElementType
  className?: string
  style?: CSSProperties
}

export function SplitWords({
  children,
  stagger = 180,
  baseDelay = 0,
  as: Tag = 'h1',
  className,
  style,
}: Props) {
  const words = children.split(/\s+/).filter(Boolean)
  return (
    <Tag className={className} style={style} aria-label={children}>
      {words.map((word, i) => (
        <span
          key={`${i}-${word}`}
          className="inline-block animate-fade-up"
          style={
            {
              animationDelay: `${baseDelay + i * stagger}ms`,
              // Fade up is an `opacity:0 → 1` + `translateY(8 → 0)`
              // keyframe; `both` on the CSS class keeps the end
              // state. We just need each word to start invisible
              // and settle in sequence.
            } as CSSProperties
          }
          aria-hidden
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Tag>
  )
}
